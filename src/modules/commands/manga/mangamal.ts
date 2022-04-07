import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { promptMessage } from "../../../utils";
const chooseArr = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
import { MangaSearchModel } from "mal-scraper";
const malScraper = require("mal-scraper");
const malSearcher = malScraper.search;

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("mangamal", {
			categories: "manga",
			aliases: ["mm"],
			info: "Get information of any manga from [myanimelist.net](https://myanimelist.net/) using [mal-scraper](https://www.npmjs.com/package/mal-scraper)",
			usage: `\`${prefix}command/alias <title>\``,
			guildOnly: true,
		});
	}

	// Below is the function to get the results of the reaction
	getResult(me: any) {
		// Pass let as me
		switch (me) {
			case "1️⃣":
				return 0;
			case "2️⃣":
				return 1;
			case "3️⃣":
				return 2;
			case "4️⃣":
				return 3;
			case "5️⃣":
				return 4;
			default:
				return null;
		}
	}

	async run(message: Message, args: string[]) {
		//checking args`
		if (!args[0]) {
			return message.channel.send("Please input the correct manga!");
		}
		const query = args.join(" ").trim();
		const msg = await message.channel.send(`Searching for \`${query}\`...`);
		const data = (await malSearcher.search("manga", { maxResults: 5, query: query })) as MangaSearchModel[];

		msg.edit(`**Manga Found!**`);

		let options = [],
			limit = data.length;
		if (data.length >= 5) limit = 5;

		for (let i = 0; i < limit; i++) options[i] = `${i + 1}. ${data[i].title}`;

		const embed = new MessageEmbed()
			.setColor("#2E51A2")
			.setAuthor({
				name: "Myanimelist.net",
				iconURL: "https://cdn.discordapp.com/attachments/799595012005822484/813811066110083072/MyAnimeList_Logo.png",
				url: "https://myanimelist.net/",
			})
			.setTitle(`Please Choose The Manga That You Are Searching For Below`)
			.setDescription(options.join("\n"));

		const optionsToChoose = await message.channel.send({ embeds: [embed] }); // Await the embed
		const reacted = await promptMessage(optionsToChoose, message.author, 50, chooseArr); // Await reaction
		const reaction = this.getResult(reacted); // Get Result from reaction
		await optionsToChoose.reactions.removeAll();

		// If no reaction
		if (reaction === null) {
			msg.delete();
			embed.setAuthor({ name: "Search aborted!" }).setTitle("").setDescription(`Search for **${query}** aborted because of no reaction from ${message.author}!`);

			optionsToChoose.edit({ embeds: [embed] });
			return;
		}

		const manga = data[reaction];
		embed
			.setColor("#2E51A2")
			.setAuthor({ name: `${manga.title} | ${manga.type}`, iconURL: manga.thumbnail, url: manga.url })
			.setDescription(manga.shortDescription ? manga.shortDescription : "-")
			.addField(`Type`, `${manga.type ? manga.type : "-"}`, true)
			.addField(`Volumes`, `${manga.vols ? manga.vols : "-"}`, true)
			.addField(`Chapters`, `${manga.nbChapters ? manga.nbChapters : "-"}`, true)
			.addField(`Scores`, `${manga.score ? manga.score : "-"}`, true)
			.addField(`Start Date`, `${manga.startDate ? manga.startDate : "-"}`, true)
			.addField(`End Date`, `${manga.endDate ? manga.endDate : "-"}`, true)
			.addField(`Members`, `${manga.members ? manga.members : "-"}`, false)
			.addFields(
				{
					name: "❯\u2000Search Online",
					// prettier-ignore
					value: `•\u2000\[Mangadex](https://mangadex.org/titles?q=${manga.title.replace(/ /g, "+")})\n\•\u2000\[MangaNato](https://manganato.com/search/story/${manga.title.replace(/ /g, "_")})\n\•\u2000\[MangaKakalot](https://mangakakalot.com/search/story/${manga.title.replace(/ /g, "_")})`,
					inline: true,
				},
				{
					name: "❯\u2000MAL Link",
					value: `•\u2000\[Click Title or Here](${manga.url})`,
					inline: true,
				},
				{
					name: "❯\u2000PV",
					value: `${manga.video ? `[Click Here](${manga.video})` : "No PV available"}`,
					inline: true,
				}
			)
			.setFooter({ text: `Data Fetched From Myanimelist.net` })
			.setTimestamp()
			.setThumbnail(manga.thumbnail);

		msg.delete();
		optionsToChoose.edit({ embeds: [embed] });
	}
};
