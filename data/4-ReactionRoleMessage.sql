/**
 * Shinsengumi is a discord bot offering general utilities and server moderation tools
 * Copyright (C) 2021 Yi Fan Song <yfsong00@gmail.com>
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

--
-- Table structure for table `ReactionRoleMessage`
--
--   This table holds the message that should be monitored for reactions for each guild.
--

CREATE DATABASE IF NOT EXISTS `yamamoto`;
USE `yamamoto`;

CREATE TABLE IF NOT EXISTS `ReactionRoleMessage` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GuildID` varchar(20) DEFAULT NULL,
  `ChannelID` varchar(20) DEFAULT NULL,
  `MessageID` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `GuildID_ChannelID_MessageID` (`GuildID`,`ChannelID`,`MessageID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;