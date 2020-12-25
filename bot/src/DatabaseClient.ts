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

import { Connection, ConnectionConfig, createConnection } from 'mysql';

import { CommandChannels, ReactionRoleDictionary, ReactionRoleMessage } from './db_types';
import { Logger } from './Logger';

export class DatabaseClient {

	private readonly timeBetweenRetries = 30;
	private logger: Logger;
	private connectionUri: string | ConnectionConfig;

	private connection?: Connection;

	public get isConnected() {
		return this.connection ? true : false;
	}

	public constructor(logger: Logger, connectionUri: string | ConnectionConfig) {
		this.logger = logger;
		this.connectionUri = connectionUri;
	}

	/**
	 * `connect` will keep trying to connect until it does, then it will resolve the promise.
	 */
	public async connect() {
		return new Promise<void>(resolve => {
			this.retryConnect(resolve);
		});
	}

	public endConnection() {
		if (this.isConnected) {
			this.connection.end();
		}
	}

	public async fetchCommandChannels() {
		return new Promise<CommandChannels[]>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			// TODO: query with where clauses
			this.connection.query('SELECT * FROM CommandChannels', function(error, results: CommandChannels[]) {
				if (error) {
					reject(error);
					return;
				}
				resolve(results);
			});
		});
	}

	public fetchReactionRoleDictionary() {
		return new Promise<ReactionRoleDictionary[]>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			// TODO: query with where clauses
			this.connection.query('SELECT * FROM ReactionRoleDictionary', function(error, results: ReactionRoleDictionary[]) {
				if (error) {
					reject(error);
					return;
				}
				resolve(results);
			});
		});
	}

	public fetchReactionRoleMessage() {
		return new Promise<ReactionRoleMessage[]>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			// TODO: query with where clauses
			this.connection.query('SELECT * FROM ReactionRoleMessage', function(error, results: ReactionRoleMessage[]) {
				if (error) {
					reject(error);
					return;
				}
				resolve(results);
			});
		});
	}

	/**
	 * returns 0 if success, 1 if channel is already set as a command channel.
	 * @param guildId 
	 * @param channelId 
	 */
	public async addCommandChannel(guildId: string, channelId: string) {
		return new Promise<number>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			this.connection.query('SELECT * FROM CommandChannels WHERE GuildID=?', guildId, (error, results: CommandChannels[]) => {
				if (error) {
					reject(error);
					return;
				};
		
				if (results.find(cc => cc.ChannelID === channelId)) {
					resolve(1);
					return;
				}
		
				this.connection.query('INSERT INTO CommandChannels (GuildID, ChannelID) VALUES (?, ?)', [guildId, channelId], (error) => {
					if (error) {
						reject(error);
						return;
					};

					resolve(0);
				});
			});
		});
	}

	/**
	 * returns 0 on success, 1 if emoji already has an associated role.
	 * @param guildId 
	 * @param emojiId 
	 * @param roleId 
	 */
	public async addReactionRoleEmoji(guildId: string, emojiId: string, roleId: string) {
		return new Promise<number>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			this.connection.query('SELECT * FROM ReactionRoleDictionary WHERE GuildID=? AND ReactionId=?', [guildId, emojiId], (error, results: ReactionRoleDictionary[]) => {
				if (error) {
					reject(error);
					return;
				};

				if (results.length > 0) {
					resolve(1);
				} else {
					this.connection.query('INSERT INTO ReactionRoleDictionary (GuildID, RoleID, ReactionID) VALUES (?, ?, ?)', [guildId, roleId, emojiId], (error) => {
						if (error) {
							reject(error);
							return;
						};
	
						resolve(0);
					});
				}
			});
		});
	}

	/**
	 * returns 0 on success
	 * @param guildId 
	 * @param emojiId 
	 */
	public async removeReactionRoleEmoji(guildId: string, emojiId: string) {
		return new Promise<number>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			this.connection.query('DELETE FROM ReactionRoleDictionary WHERE GuildID=? AND ReactionID=?', [guildId, emojiId], (error) => {
				if (error) {
					reject(error);
					return;
				};
		
				resolve(0);
			});
		});
	}

	/**
	 * returns 0 if it added a new row, 1 if it updated the existing row.
	 * @param guildId 
	 * @param channelId 
	 * @param messageId 
	 */
	public async setReactionRoleMessage(guildId: string, channelId: string, messageId: string) {
		return new Promise<number>((resolve, reject) => {
			if (!this.isConnected) {
				reject(new Error('No database connection.'));
				return;
			}

			this.connection.query('SELECT * FROM ReactionRoleMessage WHERE GuildID=?', guildId, (error, results: ReactionRoleMessage[]) => {
				if (error) {
					reject(error);
					return;
				};

				if (results.length >= 1) {
					this.connection.query('UPDATE ReactionRoleMessage SET MessageID=?, ChannelID=? WHERE GuildID=?', [messageId, channelId, guildId], (error) => {
						if (error) {
							reject(error);
							return;
						};
		
						resolve(1);
					});
				} else {
					this.connection.query('INSERT INTO ReactionRoleMessage (GuildID, MessageID, ChannelID) VALUES (?, ?, ?)', [guildId, messageId, channelId], (error) => {
						if (error) {
							reject(error);
							return;
						};
						
						resolve(0);
					});
				}
			});
		});
	}

	private retryConnect(resolve: () => void) {
		try {
			let connection = createConnection(this.connectionUri);
	
			connection.connect((error) => {
				if (error) {
					this.logger.error(error);
					this.logger.log(`Failed to connect to database, retrying in ${this.timeBetweenRetries} seconds.`);
					setTimeout(() => this.retryConnect(resolve), this.timeBetweenRetries * 1000);
				} else {
					this.connection = connection;
					resolve();
				}
			});
	
		} catch (error) {
			this.logger.error(error);
			this.logger.log(`Failed to create database connection, retrying in ${this.timeBetweenRetries} seconds.`);
			setTimeout(() => this.retryConnect(resolve), this.timeBetweenRetries * 1000);
		}
	}
}