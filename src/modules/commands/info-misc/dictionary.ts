import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed, toTitleCase } from "../../../utils";
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

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send(`Please enter a correct word to search!`);

		const thumbnail = "https://i.imgur.com/4wHZP6c.png";
		const link = "https://www.lexico.com/en/definition/" + args.join(`_`);

		try {
			const { data } = await axios.get(link);
			const $ = load(data);
			const title = toTitleCase($(".entryWrapper").find(".hw").data("headword-id") as string);

			let display: MessageEmbed[] = [];
			$(".entryWrapper")
				.children(".gramb")
				.each((i, el) => {
					const examples = `**Examples:**\n${$(el).find(".ex").first().text()}`;
					const meaning = $(el).find(".ind").text();
					const type = toTitleCase($(el).find(".pos").children(".pos").text());

					const description = [`\n\n**${type}:**`, `${meaning.replace(/\./g, `.\n\n`)}`, `${examples}`].join("\n");

					// prettier-ignore
					display[i] = new MessageEmbed()
						.setAuthor({name: "Lexico (Powered By Oxford)"})
						.setColor("RANDOM")
						.setTitle(title)
						.setDescription(description)
						.setThumbnail(thumbnail)
						.setURL(link);
				});

			paginationEmbed(message, display);
		} catch (error) {
			message.channel.send(`Couldn't find the word you're looking for!`);
		}
	}
};
