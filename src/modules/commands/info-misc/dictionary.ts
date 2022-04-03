import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../local_lib/functions";
import { load } from "cheerio";
import axios from "axios";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("dictionary", {
			aliases: ["dict"],
			categories: "info-misc",
			info: "Find the definition of a word from Oxford Dictionary using [Lexico](https://www.lexico.com/)",
			usage: `\`${prefix}command/alias <...>\``,
			guildOnly: false,
		});
	}

	toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send(`Please enter a correct word to search!`);

		let pages = [];
		const thumbnail = "https://i.imgur.com/4wHZP6c.png";
		const link = "https://www.lexico.com/en/definition/" + args.join(`_`);

		try {
			const { data } = await axios.get(link);
			const $ = load(data);
			const title = this.toTitleCase($(".entryWrapper").find(".hw").data("headword-id") as string);

			let display: MessageEmbed[] = [];
			$(".entryWrapper")
				.children(".gramb")
				.each((i, el) => {
					const examples = `**Examples:**\n${$(el).find(".ex").first().text()}`;
					const meaning = $(el).find(".ind").text();
					const type = this.toTitleCase($(el).find(".pos").children(".pos").text());

					const description = [`\n\n**${type}:**`, `${meaning.replace(/\./g, `.\n\n`)}`, `${examples}`].join("\n");

					// prettier-ignore
					display[i] = new MessageEmbed()
						.setAuthor("Lexico (Powered By Oxford)")
						.setColor("RANDOM")
						.setTitle(title)
						.setDescription(description)
						.setThumbnail(thumbnail)
						.setURL(link);
				});

			for (let i = 0; i < display.length; i++) {
				pages.push(display[i]);
			}

			paginationEmbed(message, pages, [], 300000);
		} catch (error) {
			message.channel.send(`Couldn't find the word you're looking for!`);
		}
	}
};
