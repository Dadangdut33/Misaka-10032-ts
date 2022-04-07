import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { facts } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("facts", {
			categories: "fun",
			aliases: ["fact"],
			info: "Gives you random fact. There are over 3000+ facts that are scrapped from [random-fact](https://www.npmjs.com/package/random-fact)",
			usage: `\`${prefix}facts/fact\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		return message.channel.send({
			embeds: [
				{
					description: facts[Math.floor(Math.random() * facts.length)],
					color: "RANDOM",
				},
			],
		});
	}
};
