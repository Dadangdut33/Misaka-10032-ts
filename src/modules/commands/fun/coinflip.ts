import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";

module.exports = class extends Command {
	constructor() {
		super("coinflip", {
			categories: "fun",
			aliases: ["flip"],
			info: "Flips coins",
			usage: `\`${prefix}command/alias\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		message.channel.send(Math.random() > 0.5 ? `Heads` : `Tails`);
	}
};
