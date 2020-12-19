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

import { BitFieldResolvable, Client, Message, Permissions, PermissionString } from 'discord.js';
import { Connection } from 'mysql';

import { CommandChannels } from '../db_types';
import { updateCC } from '../state';
import { replyToCommand } from '../utils/messageUtils';
import { extractChannelId, splitArguments } from '../utils/stringUtils';

export const permissions: BitFieldResolvable<PermissionString> = Permissions.FLAGS.ADMINISTRATOR;

interface waitingForInput {
	input: string;
	callback: () => void;
}

let state: waitingForInput[] = [];

/**
 * 
 */
export default (msg: Message, _: Client, db: Connection) => {

	let target: string;
	const args = splitArguments(msg.content);

	if (args.length === 0 || args[0] == 'here') {
		target = msg.channel.id;
	} else {
		target = extractChannelId(args[0]);
	}

	db.query('SELECT * FROM CommandChannels WHERE GuildID=?', msg.guild.id, (error, results: CommandChannels[]) => {
		if (error) throw error;

		if (results.find(cc => cc.ChannelID === target)) {
			replyToCommand(msg, 'The target channel is already set as a command channel');
			return;
		}

		db.query('INSERT INTO CommandChannels (GuildID, ChannelID) VALUES (?, ?)', [msg.guild.id, target], (error) => {
			if (error) throw error;

			replyToCommand(msg, 'The channel has been added to the command channels.');

			// Update the commandChannels list
			updateCC(db);
		});
	});
}