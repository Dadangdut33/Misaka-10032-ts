import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { promptMessage } from "../../../utils";
const chooseArr = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
import { Kitsu as KitsuInterface } from "kitsu.js";
const Kitsu = require("kitsu.js");
const kitsu: KitsuInterface = new Kitsu();

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("mangakitsu", {
			categories: "manga",
			aliases: ["mk"],
			info: "Get information of any manga from [kitsu.io](https://kitsu.io/explore/manga)",
			usage: `\`${prefix}command/alias <title>\``,
			guildOnly: true,
		});
	}

	capitalizeTheFirstLetterOfEachWord(words: string) {
		let separateWord = words.toLowerCase().split(" ");
		for (let i = 0; i < separateWord.length; i++) {
			separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
		}
		return separateWord.join(" ");
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
		if (!args[0]) return message.channel.send("Please input the correct manga!");

		const query = args.join(" ").trim();
		const msg = await message.channel.send(`Searching for \`${query}\`...`);

		const kitsuSearch = await kitsu.searchManga(query, 0);

		if (kitsuSearch.length === 0) return msg.edit(`No results found for **${query}**!`);

		msg.edit("**Manga found!**");

		let options = [];
		let limit = kitsuSearch.length;
		if (kitsuSearch.length >= 5) limit = 5;

		for (let i = 0; i < limit; i++)
			options[i] = `${i + 1}. ${kitsuSearch[i].titles ? `${kitsuSearch[i].titles.english ? kitsuSearch[i].titles.english : kitsuSearch[i].slug}` : kitsuSearch[i].slug}`;

		const embed = new MessageEmbed()
			.setColor("#F75136")
			.setAuthor({ name: "Kitsu.io", iconURL: "https://media.discordapp.net/attachments/799595012005822484/813793894163546162/kitsu.png", url: "https://kitsu.io/" })
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

		let manga = kitsuSearch[reaction];

		let synon = [];
		if (manga.titles.abbreviated.length < 1) {
			synon[0] = "-";
		} else {
			synon = manga.titles.abbreviated;
			for (let i = 0; i < synon.length; i++) {
				synon[i] = synon[i].replace(/[\r\n]/g, "");
			}
		}

		// Edit the embed
		embed
			.setTitle("")
			.setColor("#F75136")
			.setAuthor({
				name: `${manga.titles.english ? manga.titles.english : this.capitalizeTheFirstLetterOfEachWord(query)} | ${manga.mangaType}`,
				// @ts-ignore -> .original not shown in the data model
				iconURL: manga.posterImage.original,
				url: `https://kitsu.io/manga/${manga.id}`,
			})
			.setDescription(manga.synopsis)
			// @ts-ignore -> .japanese not shown in the data model
			.addField(`Japanese Name`, `${manga.titles.romaji ? `${manga.titles.romaji} (${manga.titles.japanese})` : "-"}`, false)
			.addField(`Synonyms`, `${synon.join(", ")}`, false)
			.addField(`Type/Rating`, `${manga.subType}/${manga.ageRating ? manga.ageRating : "N/A"}`, true)
			.addField(`Serialization`, `${manga.serialization ? manga.serialization : "-"}`, true)
			.addField(`User Count/Favorite`, `${manga.userCount}/${manga.favoritesCount}`, true)
			.addField(`Average Rating`, `${manga.averageRating ? manga.averageRating : "N/A"}`, true)
			.addField(`Rating Rank`, `${manga.ratingRank ? manga.ratingRank : "N/A"}`, true)
			.addField(`Popularity Rank`, `${manga.popularityRank ? manga.popularityRank : "N/A"}`, true)
			.addField(`Volume/Chapter`, `${manga.volumeCount ? manga.volumeCount : "N/A"}/${manga.chapterCount ? manga.chapterCount : "N/A"}`, true)
			.addField(`Start Date`, `${manga.startDate ? manga.startDate : "N/A"}`, true)
			.addField(`End Date`, `${manga.endDate ? manga.endDate : "Still ongoing"}`, true)
			.addFields(
				{
					name: "❯\u2000Search Online",
					// prettier-ignore
					value: `•\u2000\[Mangadex](https://mangadex.org/titles?q=${args.join("+")})\n\•\u2000\[MangaNato](https://manganato.com/search/story/${args.join("_")})\n•\u2000\[MangaKakalot](https://mangakakalot.com/search/story/${args.join("_")})`,
					inline: true,
				},
				{
					name: "❯\u2000Find on MAL",
					value: `•\u2000\[MyAnimeList](https://myanimelist.net/manga.php?q=${args.join("+")})`,
					inline: true,
				}
			)
			.addField(`❯\u2000\Kitsu Link`, `[Click Title or Here](https://kitsu.io/manga/${manga.id})`, true)
			.setFooter({ text: `Data Fetched From Kitsu.io` })
			.setTimestamp()
			// @ts-ignore -> .original not shown in the data model
			.setImage(manga.coverImage ? manga.coverImage.original : "")
			// @ts-ignore -> .original not shown in the data model
			.setThumbnail(manga.posterImage.original);

		msg.delete();
		optionsToChoose.edit({ embeds: [embed] });
	}
};
