import { MessageEmbed, Client, Message, HexColorString } from "discord.js";
import malScraper, { AnimeEpisodesDataModel } from "mal-scraper";
import moment from "moment-timezone";
import { BotEvent } from "../../../handler";
import { resGeh } from "./random-response/meme-response";
import { detect, format } from "./detect-haiku/detect-haiku";
import { prefix } from "../../../config.json";
import { capitalizeFirstLetter, find_DB_Return, hasNumber, insert_collection, updateOne_Collection } from "../../../utils";

module.exports = class extends BotEvent {
	constructor() {
		super("messageCreate");
		// this.disable();
		console.log(`Module: msgListener Loaded | Now seeking for haiku, geh content, anime, manga, and news to crosspost...`);
	}

	checkIfStaff(toBeCheck: string) {
		return ["Director", "Original Creator", "Producer", "Music", "Sound Director", "Series Composition"].includes(toBeCheck);
	}

	crosspost = (message: Message) => {
		const time = moment.tz("Asia/Jakarta").format("HH:mm:ss");
		const { channel } = message;

		try {
			if (channel.type === "GUILD_NEWS") {
				message.crosspost(); // crosspost automatically
				console.log(`News Published at ${time}`);
			}
		} catch (error) {
			console.log(`Fail to publish news: ${error}`);
		}
	};

	checkGeh = (message: Message) => {
		if (message.content.startsWith(prefix) || message.channel.type === "DM") return;

		if (message.content.includes("!geh")) {
			const toSend = resGeh[Math.floor(Math.random() * resGeh.length)];
			message.channel.send(toSend);
		}
	};

	detectHaiku = async (message: Message) => {
		const regexEmojiHaiku = /(:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>)/g;

		// rejected format
		if (
			message.content.startsWith(prefix) || // if message starts with prefix
			message.channel.type === "DM" || // if message is in DM
			message.mentions.members!.first() || // if message mentions someone
			message.mentions.channels.first() || // if message mentions a channel
			regexEmojiHaiku.test(message.content) || // if message contains emoji
			hasNumber(message.content) || // if message contains number
			new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(message.content) || // if message contains link
			message.content.startsWith("||") ||
			message.content.endsWith("||") ||
			message.author.bot
		)
			return;

		// Make sure it's not a spoiler and not a bot
		if (detect(message.content)) {
			let haikuGet = format(message.content.replace(/(\n)/g, " "));
			if (haikuGet.length === 0) return;

			const { author, guild } = message;
			// find in db
			const checkExist = await find_DB_Return("haiku", { author: author.id, guildId: guild?.id });
			if (checkExist.length === 0) insert_collection("haiku", { author: author.id, guildId: guild?.id, count: 1 });
			else updateOne_Collection("haiku", { author: author.id, guildId: guild?.id }, { $set: { count: checkExist[0].count + 1 } });

			haikuGet.forEach((item, index) => {
				haikuGet[index] = capitalizeFirstLetter(item);
			});

			const rgb = ("#" + Math.floor(Math.random() * 16777215).toString(16)) as HexColorString;
			message.reply({
				embeds: [
					{
						description: `*${haikuGet.join("\n\n").replace(/[\*\`\"]/g, "")}*`,
						footer: { text: "- " + message.author.username },
						color: rgb,
					},
					{
						description: `[Haiku](https://en.wikipedia.org/wiki/Haiku) detected`,
						footer: { text: `Sometimes successfully. You have created\na total of ${checkExist.length === 0 ? 1 : checkExist[0].count + 1} haiku(s) in this server` },
						color: rgb,
					},
				],
				allowedMentions: { repliedUser: false },
			});
		}
	};

	detectAnimeSearch = async (message: Message) => {
		if (message.content.startsWith(prefix) || message.channel.type === "DM") return;

		// regex for words surrounded by {{}}. Ex: {{anime}}
		const regexAnimeSearch = /\{\{([^\{\}]*)\}\}/g;

		// check if there is a match
		if (regexAnimeSearch.test(message.content)) {
			// get the match
			const match = message.content.match(regexAnimeSearch)!;
			const matches = match.map((m) => m.replace(/\{\{|\}\}/g, "").trim()); // array of matches

			// search anime
			for (let toSearch of matches) {
				if (toSearch === "") return; // Must contain something

				const msg = await message.channel.send(`Fetching data...`);
				try {
					const data = await malScraper.getInfoFromName(toSearch);

					if (!data) {
						msg.delete();
						return message.channel.send(`No results found for **${toSearch}**!`);
					}

					// -----------------------------
					// get chars and staff
					let animeChar = [],
						animeStaff = [];

					if (data.staff)
						if (data.staff.length > 0) for (let i = 0; i < data.staff.length; i++) animeStaff[i] = `• ${data.staff[i].name} - ${data.staff[i].role ? data.staff[i].role : `-`}`;
						else animeStaff = [`No staff for this anime have been added to this title.`];
					else animeStaff = [`No staff for this anime have been added to this title.`];

					if (data.characters)
						if (data.characters.length > 0)
							for (let i = 0; i < data.characters.length; i++)
								animeChar[i] = `• ${data.characters[i].name} (${data.characters[i].role}) VA: ${data.characters[i].seiyuu.name ? data.characters[i].seiyuu.name : `-`}`;
						else animeChar = ["No characters or voice actors have been added to this title."];
					else animeChar = ["No characters or voice actors have been added to this title."];

					// No Staff, sometimes the char is the staff
					if (data.characters && data.characters[0] && data.staff && data.staff[0]) {
						if (data.characters[0].name === data.staff[0].name && (data.staff[0].role === "Main" || data.staff![0].role === "Supporting") && animeStaff.length === 1)
							animeStaff = [`No staff for this anime have been added to this title.`];

						// No Character, sometimes the staff is the char
						if (data.characters[0].name === data.staff[0].name && this.checkIfStaff(data.staff[0].role!) && animeChar.length === 1)
							animeChar = [`No characters or voice actors have been added to this title.`];
					}

					// -----------------------------
					msg.delete();

					let embed = new MessageEmbed()
						.setColor("#2E51A2")
						.setAuthor({ name: `${data.englishTitle ? data.englishTitle : data.title} | ${data.type ? data.type : "N/A"}`, iconURL: data.picture, url: data.url })
						.setDescription(data.synopsis ? data.synopsis : "No synopsis available.")
						.addField("Japanese Name", `${(data as AnimeEpisodesDataModel).japaneseTitle ? `${(data as AnimeEpisodesDataModel).japaneseTitle} (${data.title})` : data.title}`, false)
						.addField("Synonyms", `${data.synonyms[0] === "" ? "N/A" : data.synonyms.join(" ")}`, false)
						.addField(`Genres`, `${data.genres ? (data.genres![0].length > 0 ? data.genres.join(", ") : "N/A") : "N/A"}`, false)
						.addField(`Age Rating`, `${data.rating ? data.rating : "N/A"}`, true)
						.addField(`Source`, ` ${data.source ? data.source : "N/A"}`, true)
						.addField(`Status`, `${data.status ? data.status : "N/A"}`, true)
						.addField(`User Count/Favorite`, `${data.members ? data.members : "N/A"}/${data.favorites ? data.favorites : "N/A"}`, true)
						.addField(`Average Score`, `${data.score ? data.score : "N/A"} (${data.scoreStats ? data.scoreStats : "N/A"})`, true)
						.addField(`Rating Rank/Popularity Rank`, `${data.ranked ? data.ranked : "N/A"}/${data.popularity ? data.popularity : "N/A"}`, true)
						.addField(`Episodes/Duration`, `${data.episodes ? data.episodes : "N/A"}/${data.duration ? data.duration : "N/A"}`, true)
						.addField(`Broadcast Date`, `${data.aired ? data.aired : "N/A"}`, true)
						.addField(`Studios`, `${data.studios!.length > 0 ? data.studios!.join(", ") : "N/A"}`, true)
						.addField(`Producers`, `${data.producers!.length > 0 ? data.producers!.join(", ") : "N/A"}`, true)
						.addField(`Staff`, `${animeStaff.join("\n")}`, false)
						.addField(`Characters`, `${animeChar.join("\n")}`, false)
						.addFields(
							{
								name: "❯\u2000Search Online",
								// prettier-ignore
								value: `•\u2000\[Gogoanime](https://www1.gogoanime.pe//search.html?keyword=${data.title.replace(/ /g, "%20")})\n•\u2000\[AnimixPlay](https://animixplay.to/?q=${data.title.replace(/ /g,"%20")})`,
								inline: true,
							},
							{
								name: "❯\u2000PV",
								value: `${data.trailer ? `•\u2000\[Click Here!](${data.trailer})` : "No PV available."}`,
								inline: true,
							},
							{
								name: "❯\u2000MAL Link",
								value: `•\u2000\[Click Title or Here](${data.url})`,
								inline: true,
							}
						)
						.setFooter({ text: `Data Fetched From Myanimelist.net` })
						.setTimestamp()
						.setThumbnail(data.picture ? data.picture : ``);

					message.reply({ embeds: [embed] });
				} catch (error) {
					console.log(error);
					msg.delete();
					message.channel.send(`Error fetching data for ${toSearch}.\nDetails: ${error}`);
				}
			}
		}
	};

	detectMangaSearch = async (message: Message) => {
		if (message.content.startsWith(prefix) || message.channel.type === "DM") return;

		// regex for words surrounded by <<>>
		const regexMangaSearch = /<<(.*?)>>/g;

		// check if there is any match
		if (regexMangaSearch.test(message.content)) {
			// get match
			const match = message.content.match(regexMangaSearch)!;
			const matches = match.map((m) => m.replace(/<<|>>/g, "").trim()); // store in matches

			// search manga
			for (let toSearch of matches) {
				if (toSearch === "") return;
				const msg = await message.channel.send(`Fetching data...`);
				const malSearcher = malScraper.search;

				malSearcher
					.search("manga", {
						maxResults: 5, // not working for some reason
						term: toSearch, // search term
					})
					.then(async (data) => {
						const manga = data[0];

						if (!manga) {
							msg.delete();
							return message.channel.send(`No results found for ${toSearch}.`);
						}

						const embed = new MessageEmbed()
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
						message.reply({ embeds: [embed] });
					})
					.catch((error) => {
						console.log(error);
						msg.delete();
						message.channel.send(`Error searching **${toSearch}**!\nDetails: ${error}`);
					});
			}
		}
	};

	botIsMentioned = (client: Client, message: Message) => {
		if (message.mentions.everyone || message.reference || message.content.startsWith(prefix) || message.author.bot) return;

		// reply with hello and prefix
		if (message.mentions.has(client.user!)) message.channel.send(`Hello there! My prefix is \`${prefix}\``);
	};

	run(client: Client, message: Message) {
		try {
			this.checkGeh(message);
			this.detectHaiku(message);
			this.detectAnimeSearch(message);
			this.detectMangaSearch(message);
			this.crosspost(message);
			this.botIsMentioned(client, message);
		} catch (e) {
			console.log(`[${new Date().toLocaleString()}] [ERROR] [msgListener]`);
			console.log(e);
		}
	}
};
