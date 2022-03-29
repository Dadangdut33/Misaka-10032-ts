import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("ghost", {
			aliases: [],
			categories: "moderation",
			info: "For ghost pinging, only usable by admin and mods",
			usage: `\`${prefix}ghost <content>\``,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[]) {
		message.delete();
	}
};
