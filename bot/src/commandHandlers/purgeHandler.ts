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

import { TextChannel, Permissions, Message, Client } from "discord.js";

export const permissions = [ Permissions.FLAGS.ADMINISTRATOR ]

/**
 * 
 */
export default (msg: Message, _: Client) => {
	if (!msg.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) return;
	
	msg.channel.bulkDelete(100).catch(console.error);

	/**
	 * Block to purge over the limit of 
	 */
	// (msg.channel as TextChannel).messages.fetch({ limit: 100 })
	// .then(msgs => {
	// 	msgs.forEach(message => message.delete().catch(console.error));
	// })
	// .catch(console.error);

	console.info(`purged channel: ${(msg.channel as TextChannel).name}`)
}