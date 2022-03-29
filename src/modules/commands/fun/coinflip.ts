import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
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
