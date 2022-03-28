import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
const stutterify = require("stutterify");

module.exports = class extends Command {
	constructor() {
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
				embed: {
					description: "Please enter the text that you want to" + ` "*stutterifys*"`,
				},
			});

		return message.channel.send(stutterify(args.join(" ")));
	}
};
