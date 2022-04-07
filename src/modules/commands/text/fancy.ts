import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { fancy } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("fancy", {
			categories: "text",
			info: '*"𝒻𝒶𝓃𝒸𝓎"* letter(s)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: "𝓅𝓁𝒆𝓪𝓈𝒆 𝒆𝓃𝓉𝒆𝓇 𝓉𝒽𝒆 𝓉𝒆𝓍𝓉 𝓉𝒽𝓪𝓉 𝓎𝑜𝓊 𝓌𝓪𝓃𝓉 𝓉𝑜 𝒻𝓪𝓃𝓬𝓎𝒻𝒾𝒆𝓈",
					},
				],
			});

		var fancied = fancy(args.join(" "));

		if (fancied === "") fancied = "Invalid text inputted";

		return message.channel.send(fancied);
	}
};
