import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import malScraper, { AnimeEpisodesDataModel } from "mal-scraper";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("animemal", {
			categories: "anime",
			aliases: ["am"],
			info: "Get information of any anime from [myanimelist.net](https://myanimelist.net/) using [mal-scraper](https://www.npmjs.com/package/mal-scraper)",
			usage: `\`${prefix}command/alias <title>\``,
			guildOnly: true,
		});
	}

	checkIfStaff(toBeCheck: string) {
		if (["Director", "Original Creator", "Producer", "Music", "Sound Director", "Series Composition"].includes(toBeCheck)) return true;
		else return false;
	}

	async run(message: Message, args: string[]) {
		//checking args
		if (!args[0]) return message.channel.send("Please input correctly!!");

		const msg = await message.channel.send(`Searching for \`${args.join(" ")}\`...`);

		//main part
		malScraper
			.getInfoFromName(args.join(" "))
			.then((data) => {
				if (!data) return message.channel.send(`No results found for **${name}**!`);

				let animeChar = [],
					animeStaff = [];

				if (data.staff) for (let i = 0; i < data.staff.length; i++) animeStaff[i] = `• ${data.staff[i].name} - ${data.staff[i].role ? data.staff[i].role : `-`}`;
				else animeStaff = [`No staff for this anime have been added to this title.`];

				if (data.characters)
					for (let i = 0; i < data.characters.length; i++)
						animeChar[i] = `• ${data.characters[i].name} (${data.characters[i].role}) VA: ${data.characters[i].seiyuu.name ? data.characters[i].seiyuu.name : `-`}`;
				else animeChar = ["No characters or voice actors have been added to this title."];

				// No Staff, sometimes the char is the staff
				if (data.characters![0].name === data.staff![0].name && (data.staff![0].role === "Main" || data.staff![0].role === "Supporting") && animeStaff.length === 1)
					animeStaff = [`No staff for this anime have been added to this title.`];

				// No Character, sometimes the staff is the char
				if (data.characters![0].name === data.staff![0].name && this.checkIfStaff(data.staff![0].role!) && animeChar.length === 1)
					animeChar = [`No characters or voice actors have been added to this title.`];

				msg.edit(`**Anime Found!**`);

				let embed = new MessageEmbed()
					.setColor("2E51A2")
					.setAuthor(`${data.englishTitle ? data.englishTitle : data.title} | ${data.type ? data.type : "N/A"}`, data.picture, data.url)
					.setDescription(data.synopsis ? data.synopsis : "No synopsis available.")
					.addField("Japanese Name", `${(data as AnimeEpisodesDataModel).japaneseTitle ? `${(data as AnimeEpisodesDataModel).japaneseTitle} (${data.title})` : data.title}`, false)
					.addField("Synonyms", `${data.synonyms[0] === "" ? "N/A" : data.synonyms.join(" ")}`, false)
					.addField(`Genres`, `${data.genres!.length > 0 ? data.genres!.join(", ") : "N/A"}`, false)
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
							value: `•\u2000\[Click Title or Here](${data.url})\n`,
							inline: true,
						}
					)
					.setFooter(`Data Fetched From Myanimelist.net`)
					.setTimestamp()
					.setThumbnail(data.picture ? data.picture : ``);

				return message.channel.send({ embed });
			})
			.catch((err) => {
				console.log(err);
				return message.channel.send(`**Error!** \n\n${err}`);
			});
	}
};
