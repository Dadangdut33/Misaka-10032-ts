import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const fraktur = require("fraktur");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("fraktur", {
			categories: "text",
			info: '*"𝔣𝔯𝔞𝔨𝔱𝔲𝔯"* letter(s) using [fraktur](https://www.npmjs.com/package/fraktur/v/1.1.0)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: "𝔓𝔩𝔢𝔞𝔰𝔢 𝔢𝔫𝔱𝔢𝔯 𝔱𝔥𝔢 𝔱𝔢𝔵𝔱 𝔱𝔥𝔞𝔱 𝔶𝔬𝔲 𝔴𝔞𝔫𝔱 𝔱𝔬 𝔣𝔯𝔞𝔨𝔱𝔲𝔯𝔦𝔣𝔦𝔢𝔰",
					},
				],
			});

		message.channel.send(fraktur.encode(args.join(" ")));
	}
};
