
export interface CommandChannels {
	ID: number;
	GuildID: string;
	ChannelID?: string;
}

export interface ReactionRoleDictionary {
	ID: number;
	GuildID: string;
	RoleID: string;
	ReactionID: string;
}

export interface ReactionRoleMessage {
	ID: number;
	GuildID: string;
	ChannelID: string;
	MessageID: string;
}
