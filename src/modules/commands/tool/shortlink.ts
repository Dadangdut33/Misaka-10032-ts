import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const shortUrl = require("node-url-shortener");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("shortlink", {
			aliases: ["shorten"],
			categories: "tool",
			info: "Shorten a link using [node-url-shortener](https://www.npmjs.com/package/node-url-shortener)",
			usage: `\`${prefix}command/alias <link that you want to shorten>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					color: "#000",
					description: `Please enter a valid url! Correct link should contain the protocol, Ex: https://youtube.com/`,
				},
			});

		shortUrl.short(args[0], function (err: any, url: string) {
			if (err) return message.channel.send(`Error: ${err}`);

			let embed = new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ format: "jpg", size: 2048 }))
				.setColor("RANDOM")
				.setTitle(`Shortlink Created!`)
				.addField(`Original Link`, args[0], false)
				.addField(`Shorten Link`, url, false);

			return message.channel.send(embed);
		});
	}
};
