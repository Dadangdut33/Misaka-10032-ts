import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";

module.exports = class extends Command {
	constructor() {
		super("ghost", {
			aliases: [],
			categories: "moderation",
			info: "For ghost pinging, only usable by admin and mods",
			usage: `${prefix}ghost <content>`,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[]) {
		message.delete();
	}
};
