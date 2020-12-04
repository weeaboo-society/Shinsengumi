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

import { MessageMentions } from 'discord.js';

/**
 * strips all discord mentions from str in the format of `<@userid>`
 */
export const stripMentions = (str: string) => {
	return str.replace(MessageMentions.USERS_PATTERN, '').trimLeft();
}

/**
 * strips the first mention of bot at the beginning of the msg 
 * @param str msg content
 */
export const stripBotMention = (str: string) => {
	return str.replace(/<@![0-9]*>/, '').trimLeft();
}

/**
 * returns the command
 */
export const extractCommand = (str: string) => {
	return stripMentions(str).split(' ')[0];
}

/**
 * 
 */
export const splitArguments = (str: string) => {
	// TODO: this is jank, maybe find better way to do this
	
	let extractedCommand = false;
	let inQuotes = false;

	let curArg = '';
	let args: string[] = [];

	for (let i = 0; i < str.length; i++) {
		const c = str[i];

		if (c === ' ') {
			if (!extractedCommand) {
				curArg = '';
				extractedCommand = true;
			} else if (inQuotes) {
				curArg += c;
			} else {
				if (curArg !== '') args.push(curArg);
				curArg = '';
			}
		} else if (c === '\"') {
			if (inQuotes) {
				inQuotes = false;
			} else {
				if (curArg !== '') args.push(curArg);
				curArg = '';
				inQuotes = true;
			}
		} else {
			curArg += c;
		}
	}

	args.push(curArg);

	return args;
}