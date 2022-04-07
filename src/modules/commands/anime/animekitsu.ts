import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { promptMessage } from "../../../utils";
const chooseArr = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
import malScraper from "mal-scraper";
import { Kitsu as KitsuInterface } from "kitsu.js";
const Kitsu = require("kitsu.js");
const kitsu: KitsuInterface = new Kitsu();

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("animekitsu", {
			categories: "anime",
			aliases: ["ak"],
			info: "Get information of any anime from [kitsu.io](https://kitsu.io/explore/anime) using kitsu.js npm",
			usage: `\`${prefix}command/alias <title> [[kitsu]]\**Notes: ** Optionally, you can search using old kitsu method by including [kitsu] in the arguments. *Notice the -> []`,
			guildOnly: true,
		});
	}

	async getNameAndUrlReturn(title: string) {
		return malScraper
			.getInfoFromName(title)
			.then((data) => {
				return {
					URL: data.url,
					name: data.title,
				};
			})
			.catch((err) => {
				console.log(err);

				return null;
			});
	}

	// Below is the function to get the results of the reaction
	chooseResult(me: any) {
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
		//checking args
		if (!args[0]) return message.channel.send("Please input the correct anime!");

		const msg = await message.channel.send(`Searching for \`${args.join(" ")}\`...`);

		const oldMethodSearch = args.join(" ").match(/\[(.*?)\]/g); // If regex match then old method
		let query = args.join(" "),
			url = "";

		if (oldMethodSearch) {
			if (oldMethodSearch[0].toLowerCase().includes("kitsu")) query = args.join(" ").replace(/\[(.*?)\]/g, "");
			else return msg.edit(`Invalid arguments provided, optional bracket should be \`[kitsu]\``);
		} else {
			const data = await this.getNameAndUrlReturn(args.join(" "));
			if (!data) return message.edit("No results found! try to use the old kitsu method");

			url = data.URL;
			query = data.name;
		}

		const kitsuSearch = await kitsu.searchAnime(query, 0);
		if (kitsuSearch.length === 0) return message.edit("No results found!");

		let options = [];
		let limit = kitsuSearch.length;
		if (kitsuSearch.length >= 5) limit = 5;
		for (let i = 0; i < limit; i++)
			options[i] = `${i + 1}. ${kitsuSearch[i].titles ? `${kitsuSearch[i].titles.english ? kitsuSearch[i].titles.english : kitsuSearch[i].slug}` : kitsuSearch[i].slug}`;

		const embed = new MessageEmbed()
			.setColor("#F75136")
			.setAuthor({ name: "Kitsu.io", iconURL: "https://media.discordapp.net/attachments/799595012005822484/813793894163546162/kitsu.png", url: "https://kitsu.io/" })
			.setTitle(`Please Choose The Anime That You Are Searching For Below`)
			.setDescription(options.join("\n"));

		const optionsToChoose = await message.channel.send({ embeds: [embed] }); // Await the embed
		const reacted = await promptMessage(optionsToChoose, message.author, 50, chooseArr); // Await reaction
		const reaction = this.chooseResult(reacted); // Get Result from reaction
		await optionsToChoose.reactions.removeAll();

		// If no reaction / invalid reaction
		if (reaction === null) {
			// If no reaction after timeout
			msg.delete();
			embed.setAuthor({ name: "Search aborted!" }).setTitle("").setDescription(`Search for **${query}** aborted because of no reaction from ${message.author}!`);

			optionsToChoose.edit({ embeds: [embed] });
			return;
		}

		let anime = kitsuSearch[reaction];
		// Results to be shown
		embed
			.setTitle("")
			.setColor("#F75136")
			.setAuthor({
				name: `${anime.titles.english ? anime.titles.english : query} | ${anime.showType}`,
				// @ts-ignore
				iconURL: anime.posterImage.original,
				url: `https://kitsu.io/anime/${anime.id}`,
			})
			.setDescription(anime.synopsis)
			.addField("Japanese Name", `${anime.titles.japanese ? anime.titles.japanese + " | " : "-"}${anime.titles.romaji ? anime.titles.romaji : `-`}`, false)
			.addField(`Age Rating`, `${anime.ageRating}`, true)
			.addField(`NSFW`, ` ${anime.nsfw ? "Yes" : "No"}`, true)
			.addField(`User Count/Favorite`, `${anime.userCount}/${anime.favoritesCount}`, true)
			.addField(`Average Rating`, `${anime.averageRating}`, true)
			.addField(`Rating Rank`, `${anime.ratingRank}`, true)
			.addField(`Popularity Rank`, `${anime.popularityRank}`, true)
			.addField(`Episodes`, `${anime.episodeCount ? anime.episodeCount : "N/A"}`, true)
			.addField(`Start Date`, `${anime.startDate}`, true)
			.addField(`End Date`, `${anime.endDate ? anime.endDate : "Still airing"}`, true)
			.addFields(
				{
					name: "❯\u2000Search Online",
					// prettier-ignore
					value: `•\u2000\[Gogoanime](https://www1.gogoanime.pe//search.html?keyword=${anime.titles.english.replace(/ /g, "%20")})\n•\u2000\[AnimixPlay](https://animixplay.to/?q=${anime.titles.english.replace(/ /g,"%20")})`,
					inline: true,
				},
				{
					name: "❯\u2000PV",
					value: `•\u2000\[Click Here!](https://youtube.com/watch?v=${anime.youtubeVideoId})`,
					inline: true,
				},
				{
					name: "❯\u2000Search on MAL",
					value: `•\u2000\[MyAnimeList](https://myanimelist.net/search/all?q=${args.join("+").replace(/\[kitsu\]/i, "")}&cat=all)`,
					inline: true,
				}
			)
			.setFooter({ text: `Data Fetched From Kitsu.io` })
			.setTimestamp()
			// @ts-ignore
			.setThumbnail(anime.posterImage.original);

		// @ts-ignore
		if (anime.coverImage) embed.setImage(anime.coverImage.original);
		msg.delete();
		optionsToChoose.edit({ embeds: [embed] });
	}
};
