import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../local_lib/functions.js";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("tafsir", {
			aliases: [],
			categories: "muslim",
			info: `Online tafsir using [Sutanlab API](https://github.com/sutanlab/quran-api).\n\n Tafsir hanya bisa untuk per ayat karena satu tafsir saja panjang sekali dan tidak cukup untuk diletakkan di embed discord.`,
			usage: `\`${prefix}command/alias <nomor surat> <ayat>\``,
			guildOnly: true,
		});
		this.prefix = prefix;
	}

	invalid_args() {
		return new MessageEmbed()
			.setTitle("Invalid Arguments")
			.setDescription(`**Usage should be like this:** \n\`${this.prefix}command/alias <nomor surat> <ayat>\``)
			.setFooter("For more info check using help commands!");
	}

	descEmbed(parsedData: any, tafsir: string) {
		return new MessageEmbed()
			.setTitle(`Q.S. ${parsedData.data.surah.name.transliteration.id}:${parsedData.data.surah.number} (${parsedData.data.number.inSurah}) ${parsedData.data.surah.name.short}`)
			.setDescription(tafsir);
	}

	async run(message: Message, args: string[]) {
		if (!args[0] || isNaN(parseInt(args[0])) || isNaN(parseInt(args[1]))) {
			return message.channel.send(this.invalid_args());
		}

		const API = await fetch(`https://api.quran.sutanlab.id/surah/${args[0]}/${args[1]}`);
		const parsedData = await API.json();

		if (parsedData.code !== 200) {
			let embed = new MessageEmbed().setTitle("Error").addField(`Status`, parsedData.status, true).addField(`Message`, parsedData.message, true);

			return message.channel.send(embed);
		}

		let pages = [];

		let infoPage = new MessageEmbed()
			.setTitle(`Q.S. ${parsedData.data.surah.name.transliteration.id}:${parsedData.data.surah.number} (${parsedData.data.number.inSurah}) ${parsedData.data.surah.name.short}`)
			.setDescription(`${parsedData.data.surah.tafsir.id}`)
			.addField(`Juz`, parsedData.data.meta.juz, true)
			.addField(`Jenis Surat`, parsedData.data.surah.revelation.id, true)
			.addField(`Arti Surat`, parsedData.data.surah.name.translation.id, true)
			.addField(`Ayat sajdah (Disarankan)`, `${parsedData.data.meta.sajda.recommended ? "Iya" : parsedData.data.meta.sajda.obligatory ? "Diwajibkan" : "Tidak"}`, true)
			.addField(`Ayat sajdah (Wajib Sujud)`, `${parsedData.data.meta.sajda.obligatory ? "Iya" : "Tidak"}`, true)
			.addField(`Audio Download`, `[Download](${parsedData.data.audio.primary})`, true);

		let theAyat = new MessageEmbed()
			.setTitle(`Q.S. ${parsedData.data.surah.name.transliteration.id}:${parsedData.data.surah.number} (${parsedData.data.number.inSurah}) ${parsedData.data.surah.name.short}`)
			.setDescription(`${parsedData.data.text.arab}\n\n**Terjemahan:**\n${parsedData.data.translation.id}`);

		pages.push(infoPage);
		pages.push(theAyat);

		let start = 0,
			end = 2048; // Cut it to 2048
		for (let i = 0; i < parsedData.data.tafsir.id.long.length / 2048; i++) {
			pages.push(this.descEmbed(parsedData, parsedData.data.tafsir.id.long.slice(start, end)));
			start += 2048;
			end += 2048;
		}

		paginationEmbed(message, pages, [], 600000);
	}
};
