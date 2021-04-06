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

import { Message, Permissions } from 'discord.js';

import { BotClient } from '../BotClient';
import { replyToCommand } from '../utils/messageUtils';
import { splitArguments } from '../utils/stringUtils';

export const permissions = [ Permissions.FLAGS.MOVE_MEMBERS ]

/**
 * 
 */
export default (msg: Message, _: BotClient) => {
	const args = splitArguments(msg.content);

	if (args.length != 2) {
		msg.reply('Failed to move users: the number of arguments doesn\'t match.');
		return;
	}

	const fromChannel = msg.guild.channels.cache.find((channel) => {
		return channel.name.toLowerCase() === args[0].toLowerCase() && channel.type == 'voice';
	});
	if (!fromChannel) {
		msg.reply('Failed to move users: could not resolve origin channel.');
		return;
	}
	const toChannel = msg.guild.channels.cache.find((channel) => {
		return channel.name.toLowerCase() === args[1].toLowerCase() && channel.type == 'voice';
	});
	if (!toChannel) {
		msg.reply('Failed to move users: could not resolve destination channel.');
		return;
	}
	
	const members = fromChannel.members;
	if (!members) {
		msg.reply('Failed to move users: there are no users to move.');
		return;
	}
	members.each(member => {
		member.voice.setChannel(toChannel).catch(console.error);
	});

	replyToCommand(msg, 'Users moved successfully');
}