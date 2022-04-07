import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const Chance = require("chance");

function alayifys(text: string) {
	return text
		.split("")
		.map((v) => (new Chance().bool() ? v.toUpperCase() : v.toLowerCase()))
		.join("");
}

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("alay", {
			aliases: ["imdisabled", "imretarded"],
			categories: "text",
			info: '**Normal Ver**\nConvert a perfectly normal, safe, non authistic words into cursed "alay" words\n\n**Alay Ver**\nconvErt A pERfeCtLY nORMAL, SaFE, Non authiSTic wordS iNtO cUrSED "alay" WOrDS',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: `PLEaSe ENTeR tHe Text ThAT yOU WAnt tO alayifYs`,
					},
				],
			});

		let msg = alayifys(args.join(" "));
		if (!msg)
			return message.channel.send({
				embeds: [
					{
						description: `Invalid text inputted!`,
					},
				],
			});

		return message.channel.send(msg);
	}
};
