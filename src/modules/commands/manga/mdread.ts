import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils/functions.js";
import { Manga, login, resolveArray } from "mangadex-full-api";
import moment from "moment-timezone";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("mdread", {
			categories: "manga",
			aliases: ["rc", "mangaread", "readchapter"],
			info: "**This command is only available in a certain guild**\nRead manga from [mangadex](https://mangadex.org/) by inputting chapter to read and the manga name. \n\n**Notes:** There might be offset of data which you can counter by getting the correct chapter from the `mdchapter` command and if you want faster reading/loading you can add [RAW] to the arguments, this will make the bot sends the image without embed.\n\nCommand possible by using [mangadex-full-api](https://www.npmjs.com/package/mangadex-full-api) which created an easy way to use [Mangadex API](https://api.mangadex.org/docs.html)",
			usage: `\`${prefix}command/alias <chapter (number)> <mangaName> [[RAW]]\``,
			guildOnly: true,
		});
	}

	noMangaFound(q: string) {
		return new MessageEmbed()
			.setTitle("No Manga Found!")
			.setDescription(`There is no result found for \`${q}\``)
			.addField("Suggestion", "Check if the manga exist or not on mangadex. If it exist but still doesn't work, then there might be a problem with the bot or the API.");
	}

	noChapterFound(q: string) {
		return new MessageEmbed()
			.setTitle("No Chapter Found!")
			.setDescription(`There is no result found for \`${q}\``)
			.addField(
				"Suggestion",
				"Check for available english chapter directly at mangadex or use `mdchapter` command to list all chapters . If it exist but still doesn't work, then there might be a problem with the bot or the API."
			);
	}

	chapterOutOfBound(chapterNum: number, maxChapter: number, mangaName: string) {
		return new MessageEmbed()
			.setTitle("Chapter Out of Bound!")
			.setDescription(`The chapter number \`${chapterNum}\` is out of bound. The maximum chapter for \`${mangaName}\` is \`${maxChapter}\``)
			.addField(
				"Suggestion",
				"Check for available chapter directly at mangadex or use `mdchapter` command to list all chapters . If it exist but still doesn't work, then there might be a problem with the bot or the API."
			);
	}

	notACorrectNumber() {
		return new MessageEmbed().setTitle("Invalid Chapter inputted!").setDescription(`Chapter must be a positive integer number`);
	}

	invalidArgs() {
		return new MessageEmbed().setTitle(`Error! Please input a correct manga name and chapter to read`).setDescription(`\`**Command usage:**\n${this.usage}\``);
	}

	async run(message: Message, args: string[]) {
		// check guild, only allow if in 640790707082231834 or 651015913080094721
		if (message.guild!.id !== "640790707082231834" && message.guild!.id !== "651015913080094721") return message.channel.send("This command is only available in a certain server!");

		if (args.length < 2) return message.channel.send(this.invalidArgs());

		let chapterNum = parseInt(args[0]),
			q = args.slice(1).join(" ").trim();

		// verify that the chapter is a number
		if (isNaN(chapterNum) || chapterNum < 1) return message.channel.send(this.notACorrectNumber());

		// regex for word that contains [RAW]
		const rawRegex = /\[RAW\]/gi;
		let raw = false;

		// check
		if (rawRegex.test(q)) {
			raw = true;
			q = q.replace(rawRegex, "").trim();
		}

		const msg = await message.channel.send(`Searching for \`${q}\` please wait...`);

		// login
		await login(process.env.Mangadex_Username!, process.env.Mangadex_Password!);

		try {
			// Get a manga:
			let manga = await Manga.getByQuery(q);

			// if manga is not found, return
			if (!manga) {
				msg.delete();
				return message.channel.send(this.noMangaFound(q));
			}

			msg.edit(`Found manga titled: \`${manga.title}\`\n\nRetrieving chapter ${chapterNum} **please wait...**`);

			// manga info
			let id = manga.id,
				originLang = manga.originalLanguage,
				title = manga.title,
				cover = (await manga.mainCover.resolve()).imageSource,
				artist = (await resolveArray(manga.artists)).map((artist) => artist.name).join(", "),
				author = (await resolveArray(manga.authors)).map((author) => author.name).join(", "),
				link = `https://mangadex.org/title/${id}`,
				// Get the manga's chapters:
				chapters = await manga.getFeed({ translatedLanguage: ["en"], order: { chapter: "asc", volume: "asc", createdAt: "asc", updatedAt: "asc", publishAt: "asc" } }, true);

			// check is there any chapter or not
			if (chapters.length === 0) return message.channel.send(this.noChapterFound(q));

			// verify that search chapter is not out of bound
			if (chapterNum > chapters.length) {
				msg.delete();
				return message.channel.send(this.chapterOutOfBound(chapterNum, chapters.length, title));
			}

			// Get the chapter's pages:
			let chapter = chapters[chapterNum - 1],
				pages = await chapter.getReadablePages();

			msg.edit(`Found manga titled: \`${manga.title}\`\n\nRetrieving ${pages.length} pages from chapter ${chapterNum} **please wait...**`);

			// check offset
			if (chapterNum !== parseInt(chapter.chapter)) {
				// send message telling offset
				message.channel.send(
					`**Offset detected!** There seems to be an offset of ${
						chapterNum - parseInt(chapter.chapter)
					} chapter(s), between the searched chapter and the result received from the API.\n**Please use \`mdchapter\` command to get chapter lists and read the correct chapter**`
				);
			}

			// Get uploader and grup names
			let uploader = await chapter.uploader.resolve(),
				groupNames = (await resolveArray(chapter.groups)).map((elem) => elem.name).join(", "),
				embedChaptersReader = [];

			if (!raw) {
				for (let i = 0; i < pages.length; i++) {
					embedChaptersReader[i] = new MessageEmbed()
						.setColor("#e6613e")
						.setAuthor(
							`${title} - Chapter ${chapter.chapter} | ${originLang} - en`,
							`https://media.discordapp.net/attachments/799595012005822484/936142797994590288/xbt_jW78_400x400.png`,
							`https://mangadex.org/chapter/${chapter.id}/${i + 1}`
						)
						.setImage(pages[i])
						.setThumbnail(cover)
						.setDescription(`[Click to look at the manga page on Mangadex](${link})\n**Manga Information**`)
						.addField("Artist", artist, true)
						.addField("Author", author, true)
						.addField(`Chapter`, `${chapter.chapter} ${chapter.title ? `- ${chapter.title}` : ``}`, true)
						.addField(`Uploaded At (GMT+7)`, moment(chapter.publishAt).tz("Asia/Jakarta").format("DD-MM-YY (HH:MM:SS)"), true)
						.addField(`Raw`, `[Click here](${pages[i]})`, true)
						.addField(
							`Search on`,
							// prettier-ignore
							`[MAL](https://myanimelist.net/manga.php?q=${title.replace(/ /g, "%20")}&cat=manga) | [MangaNato](https://manganato.com/search/story/${title.replace(/ /g, "_")}) | [MangaKakalot](https://mangakakalot.com/search/story/${title.replace(/ /g, "_")})`,
							true
						)
						.setFooter(`Page ${i + 1}/${pages.length}\nUploaded by ${uploader.username} | Scanlated by ${groupNames} | Via Mangadex.org`);
				}

				// delete message
				msg.edit(`**Loading finished!**`);
				msg.delete({ timeout: 5000 });

				// send embed
				paginationEmbed(message, embedChaptersReader, [], 1500000, true); // 25 minutes
			} else {
				// raw
				// delete message
				msg.edit(`**Loading finished! Please wait for all the raw chapter to be send**`);

				let embed = new MessageEmbed()
					.setColor("#e6613e")
					.setAuthor(
						`${title} - Chapter ${chapter.chapter} | ${originLang} - en`,
						`https://media.discordapp.net/attachments/799595012005822484/936142797994590288/xbt_jW78_400x400.png`,
						`https://mangadex.org/chapter/${chapter.id}/`
					)
					.setThumbnail(cover)
					.setDescription(`[Click to look at the manga page on Mangadex](${link})\n**Manga Information**`)
					.addField("Artist", artist, true)
					.addField("Author", author, true)
					.addField(`Chapter`, `${chapter.chapter} ${chapter.title ? `- ${chapter.title}` : ``}`, true)
					.addField(`Total Pages`, pages.length, true)
					.addField(`Uploaded At (GMT+7)`, moment(chapter.publishAt).tz("Asia/Jakarta").format("DD-MM-YY (HH:MM:SS)"), true)
					.addField(
						`Search on`,
						// prettier-ignore
						`[MAL](https://myanimelist.net/manga.php?q=${title.replace(/ /g, "%20")}&cat=manga) | [MangaNato](https://manganato.com/search/story/${title.replace(/ /g, "_")}) | [MangaKakalot](https://mangakakalot.com/search/story/${title.replace(/ /g, "_")})`,
						true
					)
					.setFooter(`RAW Mode | Uploaded by ${uploader.username} | Scanlated by ${groupNames} | Via Mangadex.org`);

				message.channel.send(embed);

				// send raw
				// max image in 1 message is 10, so get how much loop first
				let loop = Math.ceil(pages.length / 10);
				for (let i = 0; i < loop; i++) {
					await message.channel.send({ files: pages.slice(i * 10, (i + 1) * 10) });
				}

				const embedGoToTop = new MessageEmbed()
					.setColor("#e6613e")
					.setDescription(`[Click Here To Go To Top](https://discordapp.com/channels/${message.guild!.id}/${message.channel.id}/${msg.id})`);

				msg.delete({ timeout: 5000 });
				message.channel.send(embedGoToTop);
			}
		} catch (err: any) {
			// check if error contains no results
			if (err.toString().includes("no results")) return message.channel.send(this.noMangaFound(q));

			console.log(err);
			message.channel.send(err);
		}
	}
};
