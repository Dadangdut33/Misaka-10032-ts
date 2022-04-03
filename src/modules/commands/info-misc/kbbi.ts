import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import axios from "axios";
import { load } from "cheerio";
const { htmlToText } = require("html-to-text");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("kbbi", {
			categories: "info-misc",
			info: "Mencari definisi kata dari [KBBI](https://kbbi.web.id/)",
			usage: `\`${prefix}command/alias <...>\``,
			guildOnly: false,
		});
	}
	async run(message: Message, args: string[]) {
		if (args.length < 0)
			return message.channel.send({
				embed: {
					title: "Argumen invalid!",
					description: "Jika tidak yakin bagaimana cara menggunakan, harap cek dengan `help` command",
				},
			});

		// get query
		const query = args.join(` `);
		const url = "https://kbbi.web.id/";
		const link = url + query;

		// Data
		const { data } = await axios.get(link);
		const $ = load(data); // parse

		// Get each respective data
		let title = $("title").text(),
			definitionGet = $('div[id = "d1"]').html()!,
			footer = $('div[id = "footer"]').text(),
			notFound = $(".notfound").text();

		// Jika tidak ada definisi
		if (notFound.length !== 0)
			return message.channel.send({
				embed: {
					title: "Definisi tidak ditemukan!",
					description: "Tidak ditemukan definisi dari `" + query + "` Harap masukkan kata yang benar!",
				},
			});

		// embed
		const embed = new MessageEmbed()
			.setAuthor(title.replace(/<[^>]*>?/gm, ""), "https://media.discordapp.net/attachments/799595012005822484/821354290237014056/favicon.png", link.replace(/ /g, "%20"))
			.setDescription(`${htmlToText(definitionGet.slice(0, 2048))}`)
			.addField(`Detail Lebih Lanjut`, `[Klik Disini](${link.replace(/ /g, "%20")})`, false)
			.setFooter(footer);

		return message.channel.send(embed);
	}
};
