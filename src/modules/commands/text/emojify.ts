import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import GraphemeSplitter from "grapheme-splitter";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("emojify", {
			categories: "text",
			info: ":regional_indicator_e: :regional_indicator_m: :regional_indicator_o: :regional_indicator_j: :regional_indicator_i: :regional_indicator_f: :regional_indicator_y: letter(s)",
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description:
						"Please enter the text that you want to :regional_indicator_e: :regional_indicator_m: :regional_indicator_o: :regional_indicator_j: :regional_indicator_i: :regional_indicator_f: :regional_indicator_y:",
				},
			});

		let splitted = new GraphemeSplitter().splitGraphemes(args.join(" ")),
			regExp = /^[a-zA-Z]+$/;

		for (let i = 0; i < splitted.length; i++) {
			if (regExp.test(splitted[i])) splitted[i] = `:regional_indicator_${splitted[i]}:`;
		}

		return message.channel.send(splitted.join(" "));
	}
};
