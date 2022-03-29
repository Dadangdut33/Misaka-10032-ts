import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("rng", {
			categories: "tool",
			info: "Generate random number",
			usage: `\`${prefix}command/alias <min range> <max range>\``,
			guildOnly: false,
		});
		this.prefix = prefix;
	}
	getRandomIntInclusive(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
	}

	async run(message: Message, args: string[]) {
		if (!args[0] || !args[1] || isNaN(parseInt(args[0])) || isNaN(parseInt(args[1])))
			return message.channel.send({
				embed: {
					description: `Invalid format. For more info please check using the help command. Example should be like this\n\`${this.prefix}rng 0 10\``,
				},
			});

		return message.channel.send(this.getRandomIntInclusive(parseInt(args[0]), parseInt(args[1])));
	}
};
