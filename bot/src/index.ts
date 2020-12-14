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

import { Client } from 'discord.js';
import { createInterface } from 'readline';
import { getCommandHandlers } from './commandHandlers';
import { extractCommand, stripBotMention } from './utils/stringUtils';

const client = new Client();

const guildSettings = [
	{ 
		guildId: '217450051985735680', 
		commandChannel: '217450051985735680'
	},
	{
		guildId: '290296335230304259',
		commandChannel: '735775650186657822'
	},
]

const commandHandlers = getCommandHandlers();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!, id: ${client.user.id}`);
	client.user.setPresence({}).catch(console.error);
});

client.on('message', msg => {

	// Ignore private messages
	if (!msg.guild) return;
	// Ignore message if not in the guild's command channel
	if (!(msg.channel.id === guildSettings.find((setting) => setting.guildId === msg.guild.id)?.commandChannel)) return;
	// Ignore own messages
	if (msg.author.id === client.user.id) return;

	const cmd = extractCommand(msg.content);
	msg.content = stripBotMention(msg.content);
	
	{
		// Dev testing block, code to remove before commiting
		// console.info(msg);
		console.info(cmd);
		console.info(msg.content);
	}

	if (commandHandlers.has(cmd)) {
		if (msg.member.hasPermission(commandHandlers.get(cmd).permissions)) {
			commandHandlers.get(cmd).handler(msg, client);
		}
	} else {
		console.error(`no such command: ${msg.content}`);
	}
	
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
