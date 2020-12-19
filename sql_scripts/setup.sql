SET GLOBAL sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,ANSI';
SET SESSION sql_mode=@@GLOBAL.sql_mode;

CREATE DATABASE IF NOT EXISTS "yamamoto";
USE "yamamoto";

CREATE TABLE IF NOT EXISTS "CommandChannels" (
  "ID" int NOT NULL AUTO_INCREMENT,
  "GuildID" varchar(20) NOT NULL,
  "ChannelID" varchar(20) DEFAULT NULL,
  PRIMARY KEY ("ID"),
  UNIQUE KEY "ChannelID" ("ChannelID")
);

CREATE TABLE IF NOT EXISTS "ReactionRoleDictionary" (
	"ID" int NOT NULL AUTO_INCREMENT,
	"GuildID" varchar(20),
	"RoleID" varchar(20),
	"ReactionID" varchar(20),
	PRIMARY KEY ("ID"),
	UNIQUE KEY "GuildID_ReactionID" ("GuildID","ReactionID")
);

CREATE TABLE IF NOT EXISTS "ReactionRoleMessage" (
	"ID" int NOT NULL AUTO_INCREMENT,
	"GuildID" varchar(20),
	"ChannelID" varchar(20),
	"MessageID" varchar(20),
	PRIMARY KEY ("ID"),
	UNIQUE KEY "GuildID_ChannelID_MessageID" ("GuildID", "ChannelID", "MessageID")
);
