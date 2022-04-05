import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils/functions.js";
const { htmlToText } = require("html-to-text");
import axios from "axios";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("quran", {
			aliases: ["alquran", "ayat"],
			categories: "muslim",
			info: `Online quran using [Fathimah API](https://fathimah.docs.apiary.io/).\n\n Ayat maksimal untuk ditunjukan adalah 10, limit dari API nya. **Untuk pencarian dengan ayat mulai dan ayat berhenti perhatikan (-) nya**\n\n**Contoh**\`\`\`${prefix}quran cari 2 13-23\`\`\``,
			usage: `**[-]** \`${prefix}command/alias <list>\`\n**[-]** \`${prefix}command/alias <random>\`\n**[-]** \`${prefix}command/alias <cari/search/ayat/baca/read> <nomor surat> <ayat mulai-ayat berhenti>\`or\n**[-]** \`${prefix}command/alias <cari/ayat> <nomor surat> <ayat yang ingin dicari>\``,
			guildOnly: true,
		});
		this.prefix = prefix;
	}

	invalid_args() {
		return new MessageEmbed()
			.setTitle("Invalid Arguments")
			.setDescription(
				`**Usage should be like this:** \n\`${this.prefix}command/alias <list>\` or\n\`${this.prefix}command/alias <random>\` or\n\`${this.prefix}command/alias <cari/search/ayat/read/baca> <nomor surat> <ayat mulai-ayat berhenti>\` or\n\`${this.prefix}command/alias <cari/ayat> <nomor surat> <ayat yang ingin dicari>\`\n\n**Example:**\n\`${this.prefix}quran cari 2 13-23\``
			)
			.setFooter("For more info check using help commands!");
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) {
			return message.channel.send(this.invalid_args());
		}

		if (args[0].toLowerCase() == "list") {
			const { data } = await axios.get("https://api.banghasan.com/quran/format/json/surat"); // API for surat lists

			if (data.status == "error") {
				let embed = new MessageEmbed().setTitle("Error!").setDescription(data.pesan);

				return message.channel.send(embed);
			}

			let quranListed = [];
			for (let i = 0; i < data.hasil.length; i++) {
				quranListed.push(`[${data.hasil[i].nomor}] ${data.hasil[i].nama} ${data.hasil[i].asma} (Ayat: ${data.hasil[i].ayat})`);
			}

			let page1List = new MessageEmbed().setTitle(`Quran List`).setDescription(quranListed.slice(0, 50).join("\n"));
			let page2List = new MessageEmbed().setTitle(`Quran List`).setDescription(quranListed.slice(50, 100).join("\n"));
			let page3List = new MessageEmbed().setTitle(`Quran List`).setDescription(quranListed.slice(100, quranListed.length).join("\n"));

			// Array of pages
			const pages = [page1List, page2List, page3List];

			paginationEmbed(message, pages, [], 300000); // 5 Menit
		} else if (
			args[0].toLowerCase() == "cari" ||
			args[0].toLowerCase() == "search" ||
			args[0].toLowerCase() == "ayat" ||
			args[0].toLowerCase() == "baca" ||
			args[0].toLowerCase() == "read"
		) {
			args.shift(); // Remove first element
			// Now surat is on args[0], ayat is on args[1]
			const { data } = await axios.get(`https://api.banghasan.com/quran/format/json/surat/${args[0]}/ayat/${args[1]}`);

			if (data.status == "error") {
				let embed = new MessageEmbed().setTitle("Error!").setDescription(data.pesan);

				return message.channel.send(embed);
			} else {
				let ayatNLatin = [],
					terjemahan = [],
					pages = [];

				const ayatSearch = eval(args[1]);

				if (ayatSearch * -1 > 10) {
					// Dia ga ada error messagenya jd buat sendiri
					let embed = new MessageEmbed().setTitle("Error!").setDescription("Ayat Invalid!\n*Max ayat 10");

					return message.channel.send(embed);
				}

				if (data.status === "error") {
					let embed = new MessageEmbed().setTitle("Error!").setDescription(data.pesan);

					return message.channel.send(embed);
				}

				if (data.ayat.error) {
					let embed = new MessageEmbed().setTitle("Error!").setDescription("Ayat Invalid!\n*Ayat tidak ditemukan");

					return message.channel.send(embed);
				}

				for (let i = 0; i < data.ayat.data.ar.length; i++) {
					ayatNLatin.push(`${data.ayat.data.ar[i].ayat}\n${data.ayat.data.ar[i].teks}\n\n${htmlToText(data.ayat.data.idt[i].teks)}\n`);
					terjemahan.push(`${data.ayat.data.ar[i].ayat}. ${data.ayat.data.id[i].teks}`);
				}

				let start = 0,
					end = 2;
				for (let i = 0; i < ayatNLatin.length / 2; i++) {
					let embedAyat = new MessageEmbed()
						.setAuthor(`Q.S. ${data.surat.nama}:${data.surat.nomor} (${data.query.ayat})`)
						.setTitle("Ayat ke-")
						.setDescription(ayatNLatin.slice(start, end).join("\n"));

					let embedTerjemahan = new MessageEmbed()
						.setAuthor(`Q.S. ${data.surat.nama}:${data.surat.nomor} (${data.query.ayat})`)
						.setTitle("Arti ayat ke-")
						.setDescription(terjemahan.slice(start, end).join("\n"));

					start += 2;
					end += 2;
					pages.push(embedAyat);
					pages.push(embedTerjemahan);
				}

				paginationEmbed(message, pages, [], 600000); // 10 Menit
			}
		} else if (args[0].toLowerCase() == "random" || args[0].toLowerCase() == "acak") {
			const { data } = await axios.get(`https://api.banghasan.com/quran/format/json/acak`);

			if (data.status == "error") {
				let embed = new MessageEmbed().setTitle("Error!").setDescription(data.pesan);

				return message.channel.send(embed);
			}

			let embed = new MessageEmbed()
				.setAuthor(`Q.S. ${data.surat.nama}: ${data.surat.nomor} ${data.surat.asma} (${data.acak.id.ayat})`)
				.setDescription(`${data.acak.ar.teks}\n\n**Terjemahan**: \n${data.acak.id.teks}`);

			return message.channel.send(embed);
		} else {
			return message.channel.send(this.invalid_args());
		}
	}
};
