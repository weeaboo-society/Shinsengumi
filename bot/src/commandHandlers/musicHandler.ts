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
import { splitArguments } from '../utils/stringUtils';

import ytdl = require('ytdl-core');

interface Queue {
    name: string,
    url: string,
};

export const permissions: BitFieldResolvable<PermissionString> = Permissions.FLAGS.CONNECT;

const serverQueues = new Map<string,Queue[]>();
 
const helpMsg = `
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
Shows this message.\n`;

export default (msg: Message, client: BotClient) => {
    const args = splitArguments(msg.content);
    switch (args[0]) {
        case 'play': {
            if (args.length <= 2) {
                replyToCommand(msg, 'Not enough arguments.');
            }

            const voiceChannel = msg.member.voice.channel;
            if (!voiceChannel) {
                replyToCommand(msg, 'You need to be in a voice channel to play music!');
            }

            
            ytdl.getInfo(args[1])
                .then(metadata => {
                    const song = {
                        title: metadata.videoDetails.title,
                        url: metadata.videoDetails.video_url,
                    };
                });
            break;
        }
    }
}
