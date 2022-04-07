import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const vaporize = require("vaporwave");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("wide", {
			aliases: ["vaporize", "widen"],
			categories: "text",
			info: '*"ｗｉｄｅｎ"* a sentence using [vaporwave](https://www.npmjs.com/package/vaporwave)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: "Ｐｌｅａｓｅ ｅｎｔｅｒ ｔｈｅ ｔｅｘｔ ｔｈａｔ ｙｏｕ ｗａｎｔ ｔｏ ｗｉｄｅｎ",
					},
				],
			});

		let vaporized = vaporize(args.join(" "));
		if (vaporized == "") vaporized = "I couldn't widen that.";
		return message.channel.send(vaporized);
	}
};
