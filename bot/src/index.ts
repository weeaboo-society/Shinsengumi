/**
 * Shinsengumi is a discord bot offering general utilities and server moderation tools
 * Copyright (C) 2020 Yi Fan Song <yfsong00@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 **/

import { Client, MessageReaction, TextChannel, User } from 'discord.js';
import { Connection, createConnection } from 'mysql';
import { createInterface } from 'readline';

import { getCommandHandlers } from './commandHandlers';
import {
    commandChannels, reactionRoleDictionary, reactionRoleMessage, updateCC, updateRRD, updateRRM
} from './state';
import { replyToCommand } from './utils/messageUtils';
import { extractCommand, stripBotMention } from './utils/stringUtils';

const client = new Client();
   
const retryConnection = (callback: (connection: Connection) => void) => {
	try {
		let connection = createConnection({
			host     : 'shinsengumi_db',
			user     : 'root',
			password : process.env.MYSQL_ROOT_PASSWORD,
			database : 'yamamoto'
		});

		connection.connect((error) => {
			if (error) {
				console.error(error);
				setTimeout(() => retryConnection(callback), 30000);
			}

			callback(connection);
		});

	} catch (error) {
		console.error(error);
		setTimeout(() => retryConnection(callback), 30000);
	}
}

let connection: Connection;

retryConnection((con) => {
	console.info('Successfully connected to db.');
	let connection = con;
	
	updateCC(connection);
	updateRRD(connection);
	updateRRM(connection);

	const commandHandlers = getCommandHandlers();

	client.once('ready', () => {
		console.log(`Logged in as ${client.user.tag}!, id: ${client.user.id}`);
		client.user.setPresence({}).catch(console.error);

		const tryFetchReactionRoleMessage = () => {
			if (reactionRoleMessage.length !== 0) {
				reactionRoleMessage.forEach(rrm => {
					let channel = client.channels.resolve(rrm.ChannelID);
					if (channel.type === 'text') {
						(channel as TextChannel).messages.fetch(rrm.MessageID)
							.then(fetchedMsg => console.info(`Fetched message ${fetchedMsg}.`))
							.catch((err) => {
								console.error(err);
								setTimeout(() => tryFetchReactionRoleMessage(), 30000);
							});
					}
				});
			} else {
				setTimeout(() => tryFetchReactionRoleMessage(), 30000);
			}
		};

		tryFetchReactionRoleMessage();

	});

	client.on('message', msg => {

		// Ignore private messages
		if (!msg.guild) return;
		// Ignore own messages
		if (msg.author.id === client.user.id) return;
		// Ignore message if not in the guild's command channel
		const guildCommandChannels = commandChannels.filter((cc) => cc.GuildID === msg.guild.id && cc.ChannelID !== undefined);
		if (guildCommandChannels.length === 0 && msg.mentions.has(client.user)) {
			// There is no command channels setup for the guild

			// Special case for `setcc` command, this command can be used in any channel.
			if (extractCommand(msg.content.trim()) === 'setcc') {
				msg.content = stripBotMention(msg.content.trim());

				commandHandlers.get('setcc').handler(msg, client, connection);
				return;
			}

			replyToCommand(msg, 'There is no command channel setup for this server, use the `setcc` command to set one (You must be an administrator).');
			return;
		}
		if (!guildCommandChannels.find(cc => cc.ChannelID === msg.channel.id)) return;

		// Clean up user input
		const cmd = extractCommand(msg.content.trim());
		msg.content = stripBotMention(msg.content.trim());
		
		{
			// Dev testing block, code to remove before commiting
			// console.info(msg);
			console.info(cmd);
			console.info(msg.content);
		}

		if (commandHandlers.has(cmd)) {
			if (msg.member.hasPermission(commandHandlers.get(cmd).permissions)) {
				commandHandlers.get(cmd).handler(msg, client, connection);
			}
		} else {
			console.error(`no such command: ${msg.content}`);
		}
	});

	client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User) => {
		if (!user) return;
		if (user.id === client.user.id) return;
		if (!messageReaction.message.guild) return;

		messageReaction.message.guild.members.fetch(user.id)
			.then((member) => {
				const guild = messageReaction.message.guild;

				const guildRRDictionary = reactionRoleDictionary.filter(entry => entry.GuildID === guild.id);

				const roleToAdd = guildRRDictionary.find(entry => entry.ReactionID === messageReaction.emoji.id)?.RoleID;

				if (roleToAdd) member.roles.add(roleToAdd).catch(console.error);
			});
	});

	client.on('messageReactionRemove', (messageReaction: MessageReaction, user: User) => {
		if (!user) return;
		if (user.id === client.user.id) return;
		if (!messageReaction.message.guild) return;

		messageReaction.message.guild.members.fetch(user.id)
			.then((member) => {
				const guild = messageReaction.message.guild;

				const guildRRDictionary = reactionRoleDictionary.filter(entry => entry.GuildID === guild.id);

				const roleToRemove = guildRRDictionary.find(entry => entry.ReactionID === messageReaction.emoji.id)?.RoleID;

				if (roleToRemove) member.roles.remove(roleToRemove).catch(console.error);
			});
	});

	client.on('disconnect', () => {
		connection.end();
	});
});

const rl = createInterface({
	input: process.stdin,
	output: process.stdout
});

console.info(`
	Shinsengumi  Copyright (C) 2020  Yi Fan Song<yfsong00@gmail.com>
	This program comes with ABSOLUTELY NO WARRANTY; for details type 'show w'.
	This is free software, and you are welcome to redistribute it
	under certain conditions; type 'show c' for details.
`);

rl.on('line', (line) => {
	switch(line) {
		case '':
			break;
		case 'show w':
			process.stdout.write(`
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details. \n \n`);
			break;
		case 'show c':
			process.stdout.write(`
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version. \n \n`);
			break;
		default:
			process.stdout.write('No such command \n');
			break;
	}
});

client.login(process.env.BOT_TOKEN);
