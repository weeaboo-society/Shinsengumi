
CREATE DATABASE IF NOT EXISTS `yamamoto`;
USE `yamamoto`;

DROP TABLE IF EXISTS `CommandChannels`;
CREATE TABLE `CommandChannels` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GuildID` varchar(20) NOT NULL,
  `ChannelID` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ChannelID` (`ChannelID`)
);
