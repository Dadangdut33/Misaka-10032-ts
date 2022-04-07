import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const stutterify = require("stutterify");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("stutterify", {
			aliases: ["stutter"],
			categories: "text",
			info: '*"stutterifys"* a sentence using [stutterify](https://www.npmjs.com/package/stutterify)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: "Pl-Pl-Please enter the te-text th-that you wa-want to st-stutterifys",
					},
				],
			});

		return message.channel.send(stutterify(args.join(" ")));
	}
};
