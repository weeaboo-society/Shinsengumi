
CREATE DATABASE IF NOT EXISTS `yamamoto`;
USE `yamamoto`;

DROP TABLE IF EXISTS `ReactionRoleDictionary`;
CREATE TABLE `ReactionRoleDictionary` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GuildID` varchar(20) NOT NULL,
  `RoleID` varchar(20) NOT NULL,
  `ReactionID` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `GuildID_ReactionID` (`GuildID`, `ReactionID`)
);
