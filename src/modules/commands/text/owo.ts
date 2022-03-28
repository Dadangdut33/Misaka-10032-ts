import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import owoify from "owoify-js";

module.exports = class extends Command {
	constructor() {
		super("owo", {
			aliases: [],
			categories: "text",
			info: '*"owoifys"* sentence(s) using [owoify-js](https://www.npmjs.com/package/owoify-js)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description: "Please enter the text that you want to" + ` "*owoifys*"`,
				},
			});

		return message.channel.send(owoify(args.join(" ")));
	}
};
