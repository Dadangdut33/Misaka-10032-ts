import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils/functions";
import axios from "axios";
import { load } from "cheerio";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("urbandictionary", {
			aliases: ["urban"],
			categories: "info-misc",
			info: "Find the definition of a word from [Urbandictinoary](https://www.urbandictionary.com/)",
			usage: `${prefix}command/alias <...>`,
			guildOnly: false,
		});
	}

	toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt: string) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send(`Please enter a correct word to search!`);

		const query = args.join(`%20`),
			url = "https://www.urbandictionary.com/define.php?term=",
			thumbnail = "https://naeye.net/wp-content/uploads/2018/05/Urban-Dictionary-logo-475x300.png",
			link = url + query;

		try {
			const { data } = await axios.get(link);
			const $ = load(data);

			let display: MessageEmbed[] = [];
			$(".definition").each((i, el) => {
				const author = $(el).find(".ribbon").text(),
					title = this.toTitleCase($(el).find(".word").text()),
					meaning = $(el).find(".meaning").text(),
					contributor = $(el).find(".contributor").children("a").text(),
					examples = $(el).find(".example").text(),
					description = [`${meaning}`, `\n**Examples:**\n${examples}`, `\n**Author:** ${contributor}`].join("\n");

				// prettier-ignore
				display[i] = new MessageEmbed()
					.setAuthor(author)
					.setColor("RANDOM")
					.setThumbnail(thumbnail)
					.setURL(link)
					.setDescription(description)
					.setTitle(title);
			});

			paginationEmbed(message, display, [], 300000);
		} catch (error) {
			return message.channel.send("No definition found, please enter a correct word!");
		}
	}
};
