import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
const fraktur = require("fraktur");

module.exports = class extends Command {
	constructor() {
		super("frakturbold", {
			aliases: [],
			categories: "text",
			info: '*"𝔣𝔯𝔞𝔨𝔱𝔲𝔯"* letter(s) but in **𝔟𝔬𝔩𝔡** using [fraktur](https://www.npmjs.com/package/fraktur/v/1.1.0)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description: "Please enter the text that you want to" + ` "**𝔣𝔯𝔞𝔨𝔱𝔲𝔯𝔦𝔣𝔦𝔢𝔰**"`,
				},
			});

		message.channel.send("**" + fraktur.encode(args.join(" ")) + "**");
	}
};
