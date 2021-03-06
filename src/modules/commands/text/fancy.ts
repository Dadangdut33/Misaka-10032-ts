import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { fancy } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("fancy", {
			categories: "text",
			info: '*"π»πΆππΈπ"* letter(s)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: "ππππͺππ πππππ ππ½π ππππ ππ½πͺπ πππ ππͺππ ππ π»πͺππ¬ππ»πΎππ",
					},
				],
			});

		var fancied = fancy(args.join(" "));

		if (fancied === "") fancied = "Invalid text inputted";

		return message.channel.send(fancied);
	}
};
