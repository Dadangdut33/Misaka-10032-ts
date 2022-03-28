import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
const figlet = require("figlet");

module.exports = class extends Command {
	constructor() {
		super("ascii", {
			categories: "text",
			info: "Convert text to ASCII art using [Figlet](https://www.npmjs.com/package/figlet)",
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description: `Please enter the text that you want to convert bruh`,
				},
			});
		let msg = args.join(" ");

		figlet.text(msg, function (err: any, data: string) {
			if (err)
				return message.channel.send({
					embed: {
						description: `Something went wrong\n\`\`\`${err}\`\`\``,
					},
				});

			if (!data)
				return message.channel.send({
					embed: {
						description: `Invalid text inputted!`,
					},
				});

			if (data.length > 2000) return message.channel.send("Text too long!");

			message.channel.send("```" + data + "```");
		});
	}
};
