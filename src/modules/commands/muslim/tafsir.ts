import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils";
import axios from "axios";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("tafsir", {
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
			.setFooter({ text: "For more info check using help commands!" });
	}

	descEmbed(parsedData: any, tafsir: string) {
		return new MessageEmbed()
			.setTitle(`Q.S. ${parsedData.data.surah.name.transliteration.id}:${parsedData.data.surah.number} (${parsedData.data.number.inSurah}) ${parsedData.data.surah.name.short}`)
			.setDescription(tafsir);
	}

	async run(message: Message, args: string[]) {
		if (!args[0] || isNaN(parseInt(args[0])) || isNaN(parseInt(args[1]))) return message.channel.send({ embeds: [this.invalid_args()] });

		const { data } = await axios.get(`https://api.quran.sutanlab.id/surah/${args[0]}/${args[1]}`);

		if (data.code !== 200) {
			let embed = new MessageEmbed().setTitle("Error").addField(`Status`, data.status, true).addField(`Message`, data.message, true);

			return message.channel.send({ embeds: [embed] });
		}

		let pages = [];

		let infoPage = new MessageEmbed()
			.setTitle(`Q.S. ${data.data.surah.name.transliteration.id}:${data.data.surah.number} (${data.data.number.inSurah}) ${data.data.surah.name.short}`)
			.setDescription(`${data.data.surah.tafsir.id}`)
			.addField(`Juz`, data.data.meta.juz, true)
			.addField(`Jenis Surat`, data.data.surah.revelation.id, true)
			.addField(`Arti Surat`, data.data.surah.name.translation.id, true)
			.addField(`Ayat sajdah (Disarankan)`, `${data.data.meta.sajda.recommended ? "Iya" : data.data.meta.sajda.obligatory ? "Diwajibkan" : "Tidak"}`, true)
			.addField(`Ayat sajdah (Wajib Sujud)`, `${data.data.meta.sajda.obligatory ? "Iya" : "Tidak"}`, true)
			.addField(`Audio Download`, `[Download](${data.data.audio.primary})`, true);

		let theAyat = new MessageEmbed()
			.setTitle(`Q.S. ${data.data.surah.name.transliteration.id}:${data.data.surah.number} (${data.data.number.inSurah}) ${data.data.surah.name.short}`)
			.setDescription(`${data.data.text.arab}\n\n**Terjemahan:**\n${data.data.translation.id}`);

		pages.push(infoPage);
		pages.push(theAyat);

		let start = 0,
			end = 2048; // Cut it to 2048
		for (let i = 0; i < data.data.tafsir.id.long.length / 2048; i++) {
			pages.push(this.descEmbed(data, data.data.tafsir.id.long.slice(start, end)));
			start += 2048;
			end += 2048;
		}

		paginationEmbed(message, pages, [], 600000);
	}
};
