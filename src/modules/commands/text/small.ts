import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const tinytext = require("tiny-text");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("small", {
			categories: "text",
			info: "`ˢᵐᵃᶫᶫᶦᶠʸˢ` ᵃ ˢᵉᶰᵗᵉᶰᶜᵉ ᵘˢᶦᶰᵍ [tiny-text](https://www.npmjs.com/package/tiny-text)",
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description: "Please enter the text that you want to" + ` "ˢᵐᵃᶫᶫᶦᶠʸˢ"`,
				},
			});

		let tinied = tinytext(args.join(" "));
		if (tinied === "") tinied = "Invalid text inputted";
		return message.channel.send(tinied);
	}
};
