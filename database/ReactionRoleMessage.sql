
CREATE DATABASE IF NOT EXISTS `yamamoto`;
USE `yamamoto`;

DROP TABLE IF EXISTS `ReactionRoleMessage`;
CREATE TABLE `ReactionRoleMessage` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GuildID` varchar(20) NOT NULL,
  `ChannelID` varchar(20) NOT NULL,
  `MessageID` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `GuildID_ChannelID_MessageID` (`GuildID`,`ChannelID`,`MessageID`)
);
