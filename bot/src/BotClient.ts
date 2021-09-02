/**
 * Shinsengumi is a discord bot offering general utilities and server moderation tools
 * Copyright (C) 2020-2021 Yi Fan Song <yfsong00@gmail.com>
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

import { Client as DiscordjsClient, MessageReaction, User } from 'discord.js';

import { CommandHandler, getCommandHandlers } from './commandHandlers';
import { DatabaseClient } from './DatabaseClient';
import { CommandChannels, ReactionRoleDictionary, ReactionRoleMessage } from './db_types';
import { Logger } from './Logger';
import { replyToCommand } from './utils/messageUtils';
import { extractCommand, stripBotMention } from './utils/stringUtils';

interface BotStateCache {
	commandChannels: CommandChannels[];
	reactionRoleDictionary: ReactionRoleDictionary[];
	reactionRoleMessage: ReactionRoleMessage[];
}

export class BotClient {

	private readonly timeBetweenRetries = 30;
	private state: BotStateCache = {
		commandChannels: [],
		reactionRoleDictionary: [],
		reactionRoleMessage: []
	};
	
	private commandHandlers: Map<string, CommandHandler>;

	public logger: Logger;
	public discordjsClient: DiscordjsClient;
	public databaseClient: DatabaseClient;

	public constructor(logger: Logger, discordjsClient: DiscordjsClient, databaseClient: DatabaseClient) {
		this.logger = logger;
		this.discordjsClient = discordjsClient;
		this.databaseClient = databaseClient;
	}

	public async init() {
		if (!this.databaseClient.isConnected) {
			await this.databaseClient.connect();
		}

		await Promise.all([
			this.updateCommandChannels(),
			this.updateReactionRoleDictionary(),
			this.updateReactionRoleMessage()
		]);

		this.commandHandlers = getCommandHandlers();

		this.discordjsClient.once('ready', async () => {
			this.logger.log(`Logged in as ${this.discordjsClient.user.username}!`);

			this.attachMessageListener();
			this.attachReactionListeners();
			
			this.discordjsClient.on('disconnect', () => {
				this.databaseClient.endConnection();
			});
		});

		this.login();
	}

	public login() {
		let token = process.env.BOT_TOKEN;

		this.discordjsClient.login(token)
			.then()
			.catch(err => {
				this.logger.error(err);
			});
	}

	public async updateCommandChannels() {
		try {
			let commandChannels = await this.databaseClient.fetchCommandChannels();
			this.state = {...this.state, commandChannels};
		} catch (error) {
			this.logger.error(error);
			this.logger.log(`Failed to update command channels, trying again in ${this.timeBetweenRetries} seconds.`);
			setTimeout(this.updateCommandChannels, this.timeBetweenRetries * 1000);
		}
	}

	public async updateReactionRoleDictionary() {
		try {
			let reactionRoleDictionary = await this.databaseClient.fetchReactionRoleDictionary();
			this.state = {...this.state, reactionRoleDictionary};
		} catch (error) {
			this.logger.error(error);
			this.logger.log(`Failed to update reaction role dictionary, trying again in ${this.timeBetweenRetries} seconds.`);
			setTimeout(this.updateReactionRoleDictionary, this.timeBetweenRetries * 1000);
		}
	}

	public async updateReactionRoleMessage() {
		try {
			let reactionRoleMessage = await this.databaseClient.fetchReactionRoleMessage();
			this.state = {...this.state, reactionRoleMessage};
		} catch (error) {
			this.logger.error(error);
			this.logger.log(`Failed to update reaction role message, trying again in ${this.timeBetweenRetries} seconds.`);
			setTimeout(this.updateReactionRoleMessage, this.timeBetweenRetries * 1000);
		}
	}

	private attachMessageListener() {
		this.discordjsClient.on('message', async (msg) => {
			if (msg.partial) {
				try {
					await msg.fetch();
				} catch (error) {
					this.logger.error('Something went wrong when fetching the message: ', error);
					return;
				}
			}
		
			// Ignore private messages
			if (!msg.guild) return;
			// Ignore own messages
			if (msg.author.id === this.discordjsClient.user.id) return;
			// Ignore message if not in the guild's command channel
			const guildCommandChannels = this.state.commandChannels.filter((cc) => cc.GuildID === msg.guild.id && cc.ChannelID !== undefined);
			if (guildCommandChannels.length === 0 && msg.mentions.has(this.discordjsClient.user)) {
				// There is no command channels setup for the guild
		
				// Special case for `setcc` command, this command can be used in any channel.
				if (extractCommand(msg.content.trim()) === 'setcc') {
					msg.content = stripBotMention(msg.content.trim());
		
					this.commandHandlers.get('setcc').handler(msg, this);
					return;
				}
		
				replyToCommand(msg, 'There is no command channel setup for this server, use the `setcc` command to set one (You must be an administrator).');
				return;
			}
			if (!guildCommandChannels.find(cc => cc.ChannelID === msg.channel.id)) return;
		
			// Clean up user input
			const cmd = extractCommand(msg.content.trim());
			msg.content = stripBotMention(msg.content.trim());
		
			if (this.commandHandlers.has(cmd)) {
				if (msg.member.hasPermission(this.commandHandlers.get(cmd).permissions)) {
					this.commandHandlers.get(cmd).handler(msg, this);
				}
			} else {
				this.logger.error(`no such command: ${msg.content}`);
				replyToCommand(msg, `There is no such command: \`${cmd}\`.`);
			}
		});
	}

	private attachReactionListeners() {
		this.discordjsClient.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
			if (reaction.partial) {
				try {
					await reaction.fetch();
				} catch (error) {
					this.logger.error(`Error while fetching reaction: ${error}`);
		
					return;
				}
			}
			if (user.partial) {
				try {
					await user.fetch();
				} catch (error) {
					this.logger.error(`Error while fetching user: ${error}`)

					return;
				}
			}
		
			if (!user) return;
			if (user.id === this.discordjsClient.user.id) return;
			if (!reaction.message.guild) return;
		
			reaction.message.guild.members.fetch(user.id)
				.then((member) => {
					const guild = reaction.message.guild;
		
					const guildRRDictionary = this.state.reactionRoleDictionary.filter(entry => entry.GuildID === guild.id);
		
					const roleToAdd = guildRRDictionary.find(entry => entry.ReactionID === reaction.emoji.id)?.RoleID;
		
					if (roleToAdd) member.roles.add(roleToAdd).catch(this.logger.error);
				});
		});
		
		this.discordjsClient.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
			if (reaction.partial) {
				try {
					await reaction.fetch();
				} catch (error) {
					this.logger.error(`Error while fetching reaction: ${error}`);
		
					return;
				}
			}
			if (user.partial) {
				try {
					await user.fetch();
				} catch (error) {
					this.logger.error(`Error while fetching user: ${error}`)

					return;
				}
			}
		
			if (!user) return;
			if (user.id === this.discordjsClient.user.id) return;
			if (!reaction.message.guild) return;
		
			reaction.message.guild.members.fetch(user.id)
				.then((member) => {
					const guild = reaction.message.guild;
		
					const guildRRDictionary = this.state.reactionRoleDictionary.filter(entry => entry.GuildID === guild.id);
		
					const roleToRemove = guildRRDictionary.find(entry => entry.ReactionID === reaction.emoji.id)?.RoleID;
		
					if (roleToRemove) member.roles.remove(roleToRemove).catch(this.logger.error);
				});
		});
	}
}
