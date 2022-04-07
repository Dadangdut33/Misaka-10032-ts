import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import axios from "axios";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("translate", {
			aliases: ["tl"],
			categories: "tool",
			info: "Translate text using google translate.\n[Click here to see full language code](https://developers.google.com/admin-sdk/directory/v1/languages)",
			usage: `\`${prefix}command/alias <source lang code> <destination lang code> <text to translate>\``,
			guildOnly: false,
		});
		this.prefix = prefix;
	}

	async run(message: Message, args: string[]) {
		if (args.length < 3) {
			let embed = new MessageEmbed().setTitle(`Input Error`).setDescription(`Please input the correct format. Ex: \`\`\`${this.prefix}tl id en Selamat pagi!\`\`\``);

			return message.channel.send({ embeds: [embed] });
		}
		const msg = await message.channel.send(`Loading...`);

		// get results
		axios
			.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${args[0]}&tl=${args[1]}&dt=t&q=${encodeURIComponent(args.slice(2).join(" "))}`)
			.then((res) => {
				const data = res.data;
				const result = data[0][0][0];

				msg.delete();
				let embed = new MessageEmbed()
					.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
					.setTitle(`${args[0]} to ${args[1]}`)
					.setDescription(result ? result : "Fail to fetch!")
					.addField("Not correct?", `Check that the language code is correct first in [here](https://developers.google.com/admin-sdk/directory/v1/languages)`)
					.setFooter({ text: `Via Google Translate` });

				return message.channel.send({ embeds: [embed] });
			})
			.catch((err) => {
				msg.edit(`Error: ${err}`);
			});
	}
};
