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

import {
    BitFieldResolvable, Message, Permissions, PermissionString, TextChannel
} from 'discord.js';

import { BotClient } from '../botClient';
import { ReactionRoleDictionary, ReactionRoleMessage } from '../db_types';
import { updateRRD, updateRRM } from '../state';
import { replyToCommand } from '../utils/messageUtils';
import { extractEmojiId, extractRoleId, splitArguments } from '../utils/stringUtils';

export const permissions: BitFieldResolvable<PermissionString> = Permissions.FLAGS.ADMINISTRATOR;

interface waitingForInput {
	input: string;
	callback: () => void;
}

let state: waitingForInput[] = [];

/**
 * 
 */
export default (msg: Message, client: BotClient) => {

	const args = splitArguments(msg.content);

	switch(args[0]) {
		case 'set-message': {
			// TODO: Currently, doesn't quite set the new message properly, it still watches the old message, issue could also be because of the state.
			if (args.length < 3) {
				replyToCommand(msg, 'Not enough arguments');
				return;
			}
			const messageId = args[1];
			const channelId = args[2];

			client.databaseClient.setReactionRoleMessage(msg.guild.id, channelId, messageId)
				.then(n => {
					if (n === 0) {
						replyToCommand(msg, 'Successfully set the message as the reaction-role message');
						client.updateReactionRoleMessage();
					} else if (n === 1) {
						replyToCommand(msg, 'Successfully updated the message as the reaction-role message');
						client.updateReactionRoleMessage();
					}
				})
				.catch(err => {
					client.logger.error(err);
				});

			break;
		}
		case 'add': {
			if (args.length < 3) {
				replyToCommand(msg, 'Not enough arguments');
				return;
			}
			
			const emojiId = extractEmojiId(args[1]);
			const roleId = extractRoleId(args[2]);

			client.databaseClient.addReactionRoleEmoji(msg.guild.id, emojiId, roleId)
				.then(n => {
					if (n === 0) {
						replyToCommand(msg, 'Successfully linked the emoji to the role.');
						client.updateReactionRoleDictionary();
					} else if (n === 1) {
						replyToCommand(msg, 'This emoji already has an associated role, did you mean to `update`?');
					}
				})
				.catch(err => {
					client.logger.error(err);
				});

			break;
		}
		case 'update': {
			if (args.length < 3) {
				replyToCommand(msg, 'Not enough arguments');
				return;
			}
			
			const emojiId = extractEmojiId(args[1]);
			const roleId = extractRoleId(args[2]);

			replyToCommand(msg, 'not yet implemented');
			break;
		}
		case 'remove': {
			if (args.length < 2) {
				replyToCommand(msg, 'Not enough arguments');
				return;
			}

			const emojiId = extractEmojiId(args[1]);

			client.databaseClient.removeReactionRoleEmoji(msg.guild.id, emojiId)
				.then(n => {
					if (n === 0) {
						replyToCommand(msg, 'Successfully remove link between emoji and role.');
						client.updateReactionRoleDictionary();
					}
				})
				.catch(err => {
					client.logger.error(err);
				});
			break;
		}
		case 'help':
		default: {
			replyToCommand(msg, `
**Reaction-role command**
Your go to command for all reaction-role things.

> set-message <messageId> <channelId>
Sets the message to monitor for reactions. If you try to set another message, it will stop watching the old message in favor of the new message.

> add :emoji: @role
Sets the role to give when reacting with the emoji. Each emoji can only match one role, but multiple emoji can match the same role.

> update :emoji @role
Updates the role to give on the specific emoji.

> remove :emoji:
Removes the emoji from giving a role.

> help
Shows this message.
			`);
			break;
		}
	}
}
