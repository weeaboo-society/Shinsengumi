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

import { Client as DiscordjsClient } from 'discord.js';
import { createInterface } from 'readline';

import { BotClient } from './BotClient';
import { DatabaseClient } from './DatabaseClient';
import { Logger } from './Logger';

const discordjsClient = new DiscordjsClient({ partials: ['MESSAGE', 'REACTION', 'USER'] });
const logger = new Logger('EST');
const databaseClient = new DatabaseClient(logger, {
	host     : 'shinsengumi_db',
	user     : 'root',
	password : process.env.MYSQL_ROOT_PASSWORD,
	database : 'yamamoto'
});
const botClient = new BotClient(logger, discordjsClient, databaseClient);

botClient.init();

const rl = createInterface({
	input: process.stdin,
	output: process.stdout
});

process.stdout.write(`
	Shinsengumi  Copyright (C) 2020  Yi Fan Song<yfsong00@gmail.com>
	This program comes with ABSOLUTELY NO WARRANTY; for details type 'show w'.
	This is free software, and you are welcome to redistribute it
	under certain conditions; type 'show c' for details.\n\n`);

rl.on('line', (line) => {
	switch(line) {
		case '':
			break;
		case 'show w':
			process.stdout.write(`
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details. \n\n`);
			break;
		case 'show c':
			process.stdout.write(`
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version. \n\n`);
			break;
		default:
			process.stdout.write('No such command \n');
			break;
	}
});

