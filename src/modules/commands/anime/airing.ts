import { Message, MessageEmbed } from "discord.js";
import currentlyAiringAnime from "currently-airing-anime";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils";
const fetch = require("node-fetch");
global.fetch = fetch;

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

	async run(message: Message, args: string[]) {
		currentlyAiringAnime()
			.then(({ shows, next }) => {
				const pages: MessageEmbed[] = [];

				for (let i = 0; i < shows.length; i += 25) {
					let pageAdd = new MessageEmbed().setAuthor({ name: `Click For Web View`, url: `https://ricklancee.github.io/currently-airing-anime/` }).setTitle(`Current Season's Anime`);

					for (let j = 0; j < 25; j++) {
						try {
							pageAdd.addField(
								// @ts-ignore
								`${shows[i + j].title.romaji} ${shows[i + j].episodes ? `(${shows[i + j].episodes} ep) ` : ` `}[${shows[i + j].format}]`, // field title

								// content
								`[MAL Link](https://myanimelist.net/anime/${shows[i + j].idMal}) | ${this.statusReplace(shows[i + j].status)} | Next Ep in: ${
									shows[i + j].nextAiringEpisode ? this.secondsToDhms(shows[i + j].nextAiringEpisode.timeUntilAiring) : "-"
								}`
							);
						} catch (error) {
							// off limit
							break;
						}
					}
					pages.push(pageAdd);
				}

				// no next
				if (!next) {
					// add footer to each embed pages
					pages.forEach((page, index) => {
						page.setFooter({ text: `Page ${index + 1} / ${pages.length}\nStatus:\n🟡 = RELEASING | 🔵 = FINISHED | 🔴 = CANCELLED | ⌛ = NOT_YET_RELEASED` });
					});
					paginationEmbed(message, pages, [], 300000, true); // 5 Minutes
				} else {
					// next
					next()
						?.then(({ shows }) => {
							for (let i = 0; i < shows.length; i += 25) {
								let pageAdd = new MessageEmbed().setAuthor({ name: `Click For Web View`, url: `https://ricklancee.github.io/currently-airing-anime/` }).setTitle(`Current Season's Anime`);

								for (let j = 0; j < 25; j++) {
									try {
										pageAdd.addField(
											// @ts-ignore
											`${shows[i + j].title.romaji} ${shows[i + j].episodes ? `(${shows[i + j].episodes} ep) ` : ` `}[${shows[i + j].format}]`, // field title

											// content
											`[MAL Link](https://myanimelist.net/anime/${shows[i + j].idMal}) | ${this.statusReplace(shows[i + j].status)} | Next Ep in: ${
												shows[i + j].nextAiringEpisode ? this.secondsToDhms(shows[i + j].nextAiringEpisode.timeUntilAiring) : "-"
											}`
										);
									} catch (error) {
										// off limit
										break;
									}
								}
								pages.push(pageAdd);
							}

							// add footer to each embed pages
							pages.forEach((page, index) => {
								page.setFooter({ text: `Page ${index + 1} / ${pages.length}\nStatus:\n🟡 = RELEASING | 🔵 = FINISHED | 🔴 = CANCELLED | ⌛ = NOT_YET_RELEASED` });
							});
							paginationEmbed(message, pages, [], 300000, true);
						})
						.catch((err) => {
							console.log(err);
						});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
};
