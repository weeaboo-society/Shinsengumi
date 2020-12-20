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
import { Connection } from 'mysql';

import { CommandChannels, ReactionRoleDictionary, ReactionRoleMessage } from './db_types';

export let commandChannels: CommandChannels[] = [];
export let reactionRoleDictionary: ReactionRoleDictionary[] = [];
export let reactionRoleMessage: ReactionRoleMessage[] = [];

export const updateCC = (db: Connection) => {
	db.query('SELECT * FROM CommandChannels', function (error, results: CommandChannels[]) {
		if (error) throw error;

		commandChannels = results ?? [];
	});
}

export const updateRRD = (db: Connection) => {
	db.query('SELECT * FROM ReactionRoleDictionary', (error, results: ReactionRoleDictionary[]) => {
		if (error) throw error;

		reactionRoleDictionary = results ?? [];
	});
}

export const updateRRM = (db: Connection) => {
	db.query('SELECT * FROM ReactionRoleMessage', (error, results: ReactionRoleMessage[]) => {
		if (error) throw error;

		reactionRoleMessage = results ?? [];
	});
}