import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed, find_DB_Return } from "../../../utils";
import { Genshin_Ver } from "../../../config.json";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("gweapon", {
			categories: "genshin",
			info: "Gives some information of inputted genshin impact weapon\n\n**Input is case sensitive**",
			usage: `\`${prefix}command <weapon name/all>\``,
			guildOnly: true,
		});
		this.prefix = prefix;
	}

	infoInvalid() {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle("Please enter a valid weapon name!")
			.setDescription(`The input is case sensitive, you can check for the weapon list by using\n\`${this.prefix}${this.name} list\``)
			.setTimestamp();

		return embed;
	}

	dataToEmbed(data: any, message: Message, args: string[]) {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
			.setTitle(`Some Info On ${args.join(" ")}`)
			.addField(`Domain to Farm`, data.domain, true)
			.addField(`Ascension Material`, data.farm_Get, true)
			.addField(`Day to Farm`, data.farm_Day, true)
			.addField(
				`❯\u2000\External Links`,
				`• [Wiki (Direct Link)](https://genshin-impact.fandom.com/wiki/${args.join("_")})\n• [Wiki (Search)](https://genshin-impact.fandom.com/wiki/Special:Search?query=${args.join("+")})`
			);

		return embed;
	}

	async getAll(message: Message) {
		const docs = await find_DB_Return("g_Weapon", {});

		let cecilia_Garden: any = Array.from(docs).filter((filtered: any) => filtered.domain == "Cecilia Garden");

		let farm_Type_1 = Array.from(docs)
			.filter((filtered: any) => filtered.domain == "Cecilia Garden")
			.map((get: any) => get.farm_Get);

		let hidden_Palace: any = Array.from(docs).filter((filtered: any) => filtered.domain == "Hidden Palace of Lianshan Formula");

		let farm_Type_2 = Array.from(docs)
			.filter((filtered: any) => filtered.domain == "Hidden Palace of Lianshan Formula")
			.map((get: any) => get.farm_Get);

		let pages = [];

		pages[0] = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
			.setDescription(`Below are lists of weapons currently in genshin impact Version ${Genshin_Ver}\n\nDomain: \`Cecilia Garden\``)
			.addField(`❯\u2000${farm_Type_1[0]} [${cecilia_Garden[0].weapons.length}]:`, cecilia_Garden[0].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(`❯\u2000${farm_Type_1[1]} [${cecilia_Garden[1].weapons.length}]:`, cecilia_Garden[1].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(`❯\u2000${farm_Type_1[2]} [${cecilia_Garden[2].weapons.length}]:`, cecilia_Garden[2].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(
				`❯\u2000\Search on Wiki`,
				`• [${farm_Type_1[0]}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_1[0].replace(/\s/g, "+")})\n• [${
					farm_Type_1[1]
				}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_1[1].replace(/\s/g, "+")})\n• [${
					farm_Type_1[2]
				}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_1[2].replace(/\s/g, "+")})`
			)
			.setTimestamp();

		pages[1] = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
			.setDescription(`Below are lists of weapons currently in genshin impact ${Genshin_Ver}\n\nDomain: \`Hidden Palace of Lianshan Formula\``)
			.addField(`❯\u2000${farm_Type_2[0]} [${hidden_Palace[0].weapons.length}]:`, hidden_Palace[0].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(`❯\u2000${farm_Type_2[1]} [${hidden_Palace[1].weapons.length}]:`, hidden_Palace[1].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(`❯\u2000${farm_Type_2[2]} [${hidden_Palace[2].weapons.length}]:`, hidden_Palace[2].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(
				`❯\u2000\Search on Wiki`,
				`• [${farm_Type_2[0]}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_2[0].replace(/\s/g, "+")})\n• [${
					farm_Type_2[1]
				}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_2[1].replace(/\s/g, "+")})\n• [${
					farm_Type_2[2]
				}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_2[2].replace(/\s/g, "+")})`
			)
			.setTimestamp();

		paginationEmbed(message, pages);
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send({ embeds: [this.infoInvalid()] });

		switch (args.join(" ").toLowerCase()) {
			case "all":
			case "list":
			case "semua":
				await this.getAll(message);
				break;

			default:
				const docs = await find_DB_Return("g_Weapon", { weapons: args.join(" ") });
				if (!docs[0]) return message.channel.send({ embeds: [this.infoInvalid()] });
				else return message.channel.send({ embeds: [this.dataToEmbed(docs[0], message, args)] });
		}
	}
};
