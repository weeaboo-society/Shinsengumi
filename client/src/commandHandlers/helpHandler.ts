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

import { BitFieldResolvable, Message, Permissions, PermissionString } from 'discord.js';

import { BotClient } from '../BotClient';
import { replyToCommand } from '../utils/messageUtils';

export const permissions: BitFieldResolvable<PermissionString> = Permissions.FLAGS.ADMINISTRATOR;

const helpMsg = `
**Shinsengumi Commands**

> move <origin> <destination>
moves user from origin to destination voice channels

> ping
check if bot is dead

> purge
removes up to 100 messages that are less than 2 weeks old (limitations of discord api)

> reaction-role
setting up reaction roles, check its help page

> setcc
setting up a command channel
`;

/**
 * 
 */
export default (msg: Message, _: BotClient) => {
	replyToCommand(msg, helpMsg);
}