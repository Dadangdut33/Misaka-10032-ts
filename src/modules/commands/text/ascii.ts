import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const figlet = require("figlet");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
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
				embeds: [
					{
						description: `Please enter the text that you want to convert bruh`,
					},
				],
			});
		let msg = args.join(" ");

		figlet.text(msg, function (err: any, data: string) {
			if (err)
				return message.channel.send({
					embeds: [
						{
							description: `Something went wrong\n\`\`\`${err}\`\`\``,
						},
					],
				});

			if (!data)
				return message.channel.send({
					embeds: [
						{
							description: `Invalid text inputted!`,
						},
					],
				});

			if (data.length > 2000) return message.channel.send("Text too long!");

			message.channel.send("```" + data + "```");
		});
	}
};
