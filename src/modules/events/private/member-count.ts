import { Client, Guild } from "discord.js";
import { BotEvent } from "../../../handler";
import { private_Events_Info } from "../../../config.json";

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	run(client: Client) {
		const guildID = private_Events_Info.personalServer.id,
			channelID = private_Events_Info.personalServer.channel_vc;

		const personalGuild = client.guilds.cache.get(guildID);
		if (!personalGuild) return console.log("Invalid guild for member count");

		try {
			const theID = channelID;
			const updateMembers = (guild: Guild) => {
				const channel = guild.channels.cache.get(theID);
				if (channel) channel.setName(`Total Members: ${guild.memberCount}`);
			};

			client.on("guildMemberAdd", (member) => {
				if (member.guild === personalGuild) updateMembers(member.guild); // updateMembers if the guild is the personal guild
			});
			client.on("guildMemberRemove", (member) => {
				if (member.guild === personalGuild) updateMembers(member.guild); // updateMembers if the guild is the personal guild
			});

			updateMembers(personalGuild);

			console.log(`Module: Member-Count Loaded | Loaded from local module | Now waiting for new members...`);
		} catch (e) {
			console.log(`[${new Date().toLocaleString()}] [ERROR] [member-count]`);
			console.log(e);
		}
	}
};
