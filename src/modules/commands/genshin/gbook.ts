import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed, find_DB_Return, capitalizeFirstLetter } from "../../../utils";
import { Genshin_Ver } from "../../../config.json";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("gbook", {
			categories: "genshin",
			info: "Gives information about talent book in genshin impact",
			usage: `\`${prefix}command <name/all>\``,
			guildOnly: true,
		});
		this.prefix = prefix;
	}

	tatangSutarma(message: Message) {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle(`Information on the legendary "Tatang Sutarma"`)
			.setDescription(
				`Requested by the chosen one ${message.author}, Konon katanya buku ini hanya ada satu di dunia dan hanya dipegang oleh satu-satunya sang sakti yaitu Sule sendiri\n
      Tapi, tahukah anda kalau buku tatang sutarma benar benar ada? dan buku itu ada sejak tahun 1788. Dalam buku ini terdapat terjemahan dari kitab-kitab Sunda Kuno karya pujangga besar yang meliputi 14 kitab. Keempat belas kitab kuno itu menjadi pedoman hidup sehari-hari masyarakat Jawa yang diwariskan secara turun-temurun dari generasi ke generasi. Pada saat-saat tertentu malah dijadikan bahan renungan yang menambah kekayaan rohani. Kita pantas bersyukur dengan kreatifitas dan produktifitas nenek moyang itu. Harkat dan martabat kita semakin mantab, karena mempunyai jati diri yang berupa kearifan lokal. Berbagai permasalahan yang terjadi sekarang sebenarnya bisa diatasi dengan butir-butir budaya luhur masa silam.`
			)
			.addField("❯\u2000Found On:", "Indonesia - Unspecified Location", true)
			.addField("❯\u2000Day To Farm:", "Confidential Information", true)
			.addField("❯\u2000Chapter That Are Released To Public Can Be Found On:", "https://buku-tatang-sutarman.blogspot.com/")
			.setImage("https://cdn.discordapp.com/attachments/651015913080094724/794514667992776724/Tatang_Sutarma.gif")
			.setFooter({ text: "Above are images of Tatang Sutarma Sighting In Public" })
			.setTimestamp();

		return embed;
	}

	infoInvalid() {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle("Please enter the correct name of the book that you want to check!")
			.setDescription("There are currently 6 books for talent upgrade in genshin impact. You can use this command to check each of their farming information")
			.addField("❯\u2000Book Lists:", "- Gold\n- Ballad\n- Freedom\n- Prosperity\n- Resistance")
			.addField(`You can also check every book by inputting all`, `${this.prefix}${this.name} all`)
			.setTimestamp();

		return embed;
	}

	dataToEmbed(data: any, message: Message) {
		let chars: any[] = [];
		Array.from(data, (newData: any) => {
			chars.push(newData.name[0]);
		});

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle(`Information on "${data[0].book}" Book`)
			.setDescription(`Requested by ${message.author}\n**Data are based on game V${Genshin_Ver}**`)
			.addField("❯\u2000Found On:", data[0].domain, true)
			.addField("❯\u2000Day to Farm:", data[0].fields.farmDay, true)
			.addField("❯\u2000Character That Needs It:", chars.join(", "))
			.setTimestamp();

		return embed;
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send({ embeds: [this.infoInvalid()] });

		switch (args.join(" ").toLowerCase()) {
			case "all":
				let pages = [];
				let temp;
				temp = await find_DB_Return("g_Char", { book: "Gold" });
				pages.push(this.dataToEmbed(temp, message));
				temp = await find_DB_Return("g_Char", { book: "Ballad" });
				pages.push(this.dataToEmbed(temp, message));
				temp = await find_DB_Return("g_Char", { book: "Freedom" });
				pages.push(this.dataToEmbed(temp, message));
				temp = await find_DB_Return("g_Char", { book: "Prosperity" });
				pages.push(this.dataToEmbed(temp, message));
				temp = await find_DB_Return("g_Char", { book: "Resistance" });
				pages.push(this.dataToEmbed(temp, message));

				paginationEmbed(message, pages);
				break;

			case "tatang sutarma":
			case "hidden":
			case "rahasia negara":
			case "rahasia":
			case "misteri":
			case "harta karun":
			case "tatang":
				message.channel.send({ embeds: [this.tatangSutarma(message)] });
				break;

			default:
				const dataGet = await find_DB_Return("g_Char", { book: capitalizeFirstLetter(args.join(" ").toLowerCase()) });
				if (dataGet.length === 0) return message.channel.send({ embeds: [this.infoInvalid()] });

				message.channel.send({ embeds: [this.dataToEmbed(dataGet, message)] });
				break;
		}
	}
};
