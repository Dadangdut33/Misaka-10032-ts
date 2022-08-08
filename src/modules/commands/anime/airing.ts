import { EmbedFieldData, Message, MessageEmbed } from "discord.js";
import currentlyAiringAnime, { AiringAnime, Media } from "currently-airing-anime";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils";
const fetch = require("node-fetch");
global.fetch = fetch;

interface MediaExtended extends Media {
	format: string;
}

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("airing", {
			categories: "anime",
			info: "Get current season's airing information using [currently-airing-anime](https://github.com/ricklancee/currently-airing-anime)",
			usage: `\`${prefix}command\``,
			guildOnly: true,
		});
	}

	statusReplace = (status: string) => {
		switch (status) {
			case "RELEASING":
				return "🟡";
			case "FINISHED":
				return "🔵";
			case "CANCELLED":
				return "🔴";
			case "NOT_YET_RELEASED":
				return "⌛";
			default:
				return "-";
		}
	};

	secondsToDhms(seconds: number) {
		seconds = Number(seconds);
		let d = Math.floor(seconds / (3600 * 24));
		let h = Math.floor((seconds % (3600 * 24)) / 3600);
		let m = Math.floor((seconds % 3600) / 60);
		let s = Math.floor(seconds % 60);

		let dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
		return dDisplay + "+ " + h + ":" + m + ":" + s;
	}

	async getCurrentlyAiringAnime(pagesDataArr: any[], airingData?: AiringAnime) {
		let pagesData = pagesDataArr;
		const data = airingData ? airingData : await currentlyAiringAnime();

		pagesData = pagesData.concat(data.shows.map((data) => data));
		if (data.next) pagesData = pagesData.concat(await this.getCurrentlyAiringAnime(pagesData, await data.next()!));

		return pagesData;
	}

	async run(message: Message, args: string[]) {
		const msg = await message.channel.send("Fetching data...");

		const pagesData: MediaExtended[] = [...new Set(await this.getCurrentlyAiringAnime([]))]; // remove dupe
		const pages: MessageEmbed[] = [],
			pagesFields: EmbedFieldData[][] = [];
		const statusHierarchy = ["RELEASING", "FINISHED", "CANCELLED", "NOT_YET_RELEASED"];
		const formatHierarchy = ["TV", "TV_SHORT", "OVA", "ONA", "SPECIAL", "MOVIE", "MUSIC", "MANGA", "NOVEL", "NONE"];

		// sort by date (time until airing) first, then format, then status
		msg.edit("Sorting data...");
		pagesData
			.sort((a, b) => {
				return (a.nextAiringEpisode ? a.nextAiringEpisode.timeUntilAiring : 0) - (b.nextAiringEpisode ? b.nextAiringEpisode.timeUntilAiring : 0);
			})
			.sort((a, b) => {
				return formatHierarchy.indexOf(a.format) - formatHierarchy.indexOf(b.format);
			})
			.sort((a, b) => {
				return statusHierarchy.indexOf(a.status) - statusHierarchy.indexOf(b.status);
			});

		msg.edit("Creating embeds...");
		for (let i = 0; i < pagesData.length; i += 25) {
			let pageAdd: EmbedFieldData[] = [];

			for (let j = i; j < i + 25; j++) {
				try {
					pageAdd.push({
						name: `${pagesData[j].title.romaji} ${pagesData[j].episodes ? `(${pagesData[j].episodes} ep) ` : ` `}[${pagesData[j].format}]`,
						value: `[MAL](https://myanimelist.net/anime/${pagesData[j].idMal}) | ${this.statusReplace(pagesData[j].status)} | Next Ep ${
							// pagesData[j].nextAiringEpisode ? this.secondsToDhms(pagesData[j].nextAiringEpisode.timeUntilAiring) : "-"
							pagesData[j].nextAiringEpisode ? `<t:${Math.floor(new Date().valueOf() / 1000 + pagesData[j].nextAiringEpisode.timeUntilAiring)}:R> ` : "-"
						}`,
					});
				} catch (error) {
					break;
				}
			}

			pagesFields.push(pageAdd);
		}

		pagesFields.forEach((fields, i) => {
			pages.push(
				new MessageEmbed()
					.setTitle(`Current Season's Anime`)
					.setDescription("**Status**:\n🟡 = RELEASING\n🔵 = FINISHED\n🔴 = CANCELLED\n⌛ = NOT_YET_RELEASED\n====================")
					.setFields(fields)
			);
		});

		msg.edit("Data fetched! Sending...");
		setTimeout(() => {
			msg.delete();
		}, 1000);

		return paginationEmbed(message, pages, [], 300000); // 5 Minutes
	}
};
