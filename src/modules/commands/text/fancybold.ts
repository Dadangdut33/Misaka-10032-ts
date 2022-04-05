import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { fancy } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("fancybold", {
			categories: "text",
			info: '*"𝒻𝒶𝓃𝒸𝓎"* letter(s) but in **𝒷𝑜𝓁𝒹**',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description: "Please enter the text that you want to" + ` "**𝒻𝒶𝓃𝒸𝒾𝒻𝓎𝓈**"`,
				},
			});

		var fancied = fancy(args.join(" "));

		if (fancied === "") fancied = "Invalid text inputted";

		return message.channel.send("**" + fancied + "**");
	}
};
