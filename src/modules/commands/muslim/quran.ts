import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { paginationEmbed } from "../../../local_lib/functions.js";
const { htmlToText } = require("html-to-text");

module.exports = class extends Command {
	constructor() {
		super("quran", {
			aliases: ["alquran", "ayat"],
			categories: "muslim",
			info: `Online quran using [Fathimah API](https://fathimah.docs.apiary.io/).\n\n Ayat maksimal untuk ditunjukan adalah 10, limit dari API nya. **Untuk pencarian dengan ayat mulai dan ayat berhenti perhatikan (-) nya**\n\n**Contoh**\`\`\`${prefix}quran cari 2 13-23\`\`\``,
			usage: `**-** \`${prefix}command/alias <list>\`\n**-** \`${prefix}command/alias <random>\`\n**-** \`${prefix}command/alias <cari/search/ayat/baca/read> <nomor surat> <ayat mulai-ayat berhenti>\`or\n**-** \`${prefix}command/alias <cari/ayat> <nomor surat> <ayat yang ingin dicari>\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) {
			info();
			return;
		}

		if (args[0].toLowerCase() == "list") {
			const list = await fetch("https://api.banghasan.com/quran/format/json/surat"); // API for surat lists
			const quranToList = await list.json();

			if (quranToList.status == "error") {
				let embed = new MessageEmbed().setTitle("Error!").setDescription(quranToList.pesan);

				return message.channel.send(embed);
			}

			let quranListed = [];
			for (let i = 0; i < quranToList.hasil.length; i++) {
				quranListed.push(`[${quranToList.hasil[i].nomor}] ${quranToList.hasil[i].nama} ${quranToList.hasil[i].asma} (Ayat: ${quranToList.hasil[i].ayat})`);
			}

			let page1List = new MessageEmbed().setTitle(`Quran List`).setDescription(quranListed.slice(0, 50).join("\n"));
			let page2List = new MessageEmbed().setTitle(`Quran List`).setDescription(quranListed.slice(50, 100).join("\n"));
			let page3List = new MessageEmbed().setTitle(`Quran List`).setDescription(quranListed.slice(100, quranListed.length).join("\n"));

			// Array of pages
			const pages = [page1List, page2List, page3List];

			paginationEmbed(message, pages, [], 300000); // 5 Menit
		} else if (args[0].toLowerCase() == "cari" || args[0].toLowerCase() == "search" || args[0].toLowerCase() == "ayat" || args[0].toLowerCase() == "baca" || args[0].toLowerCase() == "read") {
			args.shift(); // Remove first element
			// Now surat is on args[0], ayat is on args[1]
			const data = await fetch(`https://api.banghasan.com/quran/format/json/surat/${args[0]}/ayat/${args[1]}`);
			const dataParsed = await data.json();

			if (dataParsed.status == "error") {
				let embed = new MessageEmbed().setTitle("Error!").setDescription(dataParsed.pesan);

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

				if (dataParsed.status === "error") {
					let embed = new MessageEmbed().setTitle("Error!").setDescription(dataParsed.pesan);

					return message.channel.send(embed);
				}

				if (dataParsed.ayat.error) {
					let embed = new MessageEmbed().setTitle("Error!").setDescription("Ayat Invalid!\n*Ayat tidak ditemukan");

					return message.channel.send(embed);
				}

				for (let i = 0; i < dataParsed.ayat.data.ar.length; i++) {
					ayatNLatin.push(`${dataParsed.ayat.data.ar[i].ayat}\n${dataParsed.ayat.data.ar[i].teks}\n\n${htmlToText(dataParsed.ayat.data.idt[i].teks)}\n`);
					terjemahan.push(`${dataParsed.ayat.data.ar[i].ayat}. ${dataParsed.ayat.data.id[i].teks}`);
				}

				let start = 0,
					end = 2;
				for (let i = 0; i < ayatNLatin.length / 2; i++) {
					let embedAyat = new MessageEmbed()
						.setAuthor(`Q.S. ${dataParsed.surat.nama}:${dataParsed.surat.nomor} (${dataParsed.query.ayat})`)
						.setTitle("Ayat ke-")
						.setDescription(ayatNLatin.slice(start, end).join("\n"));

					let embedTerjemahan = new MessageEmbed()
						.setAuthor(`Q.S. ${dataParsed.surat.nama}:${dataParsed.surat.nomor} (${dataParsed.query.ayat})`)
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
			const data = await fetch(`https://api.banghasan.com/quran/format/json/acak`);
			const dataParsed = await data.json();

			if (dataParsed.status == "error") {
				let embed = new MessageEmbed().setTitle("Error!").setDescription(dataParsed.pesan);

				return message.channel.send(embed);
			}

			let embed = new MessageEmbed()
				.setAuthor(`Q.S. ${dataParsed.surat.nama}: ${dataParsed.surat.nomor} ${dataParsed.surat.asma} (${dataParsed.acak.id.ayat})`)
				.setDescription(`${dataParsed.acak.ar.teks}\n\n**Terjemahan**: \n${dataParsed.acak.id.teks}`);

			return message.channel.send(embed);
		} else {
			info();
		}

		function info() {
			let embed = new MessageEmbed()
				.setTitle("Invalid Arguments")
				.setDescription(
					`**Usage should be like this:** \n\`${prefix}command/alias <list>\` or\n\`${prefix}command/alias <random>\` or\n\`${prefix}command/alias <cari/search/ayat/read/baca> <nomor surat> <ayat mulai-ayat berhenti>\` or\n\`${prefix}command/alias <cari/ayat> <nomor surat> <ayat yang ingin dicari>\`\n\n**Example:**\n\`${prefix}quran cari 2 13-23\``
				)
				.setFooter("For more info check using help commands!");

			return message.channel.send(embed);
		}
	}
};
