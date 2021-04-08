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

import { BotClient } from '../BotClient';
import { splitArguments } from '../utils/stringUtils';

export const permissions: BitFieldResolvable<PermissionString> = Permissions.FLAGS.ADMINISTRATOR;

/**
 * 
 */
export default (msg: Message, client: BotClient) => {
	const args = splitArguments(msg.content);

	const messageId = args[1];
	const channelId = msg.guild.channels.cache.filter(ch => ch.type === 'text').filter(ch => {
		let fetchedMessage;
		let lock = true;

		(ch as TextChannel).messages.fetch(messageId)
			.then(m => {fetchedMessage = m})
			.catch(console.error)
			.finally(() => {lock = false});
		
		while(lock);

		return fetchedMessage !== undefined;
	});
}