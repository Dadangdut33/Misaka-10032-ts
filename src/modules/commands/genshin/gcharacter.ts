import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed, find_DB_Return, capitalizeFirstLetter } from "../../../utils";
import { Genshin_Ver } from "../../../config.json";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("gcharacter", {
			categories: "genshin",
			aliases: ["gchar"],
			info: "Gives information about character farming info in genshin impact",
			usage: `\`${prefix}command/alias <name> or [lvlup] or [list]\``,
			guildOnly: true,
		});
		this.prefix = prefix;
	}

	notFound() {
		let embed = new MessageEmbed().setTitle("Invalid Character Name").setDescription(`For character list, check using ${this.prefix}${this.name} list`);
		return embed;
	}

	lvlUp() {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle(":arrow_down: Materials and mora needed for lvl up")
			.setImage("https://cdn.discordapp.com/attachments/799595012005822484/799595215521316924/EriB3vTVkAYs0HD.png");
		return embed;
	}

	embedCharacter(data: any) {
		let embed = new MessageEmbed()
			.setColor(data.color)
			.setAuthor({ name: `${data.name[0]} ${data.stars}`, iconURL: data.pic_Small })
			.setDescription(`**Data are based on game v${Genshin_Ver}**\n${data.name[0]} ${data.description}`)
			.addField("❯\u2000Talent Leveling Material:", data.fields.talent, true)
			.addField("❯\u2000Character Ascension Material:", data.fields.charAsc, true)
			.addField("❯\u2000World boss to gain material:", data.fields.worldBoss)
			.addField("❯\u2000Day To Farm Talent Material:", data.fields.farmDay)
			.addField("❯\u2000Special Passive", data.fields.passive)
			.setImage(data.pic_Big);
		return embed;
	}

	embedCard(data: any) {
		let embed = new MessageEmbed()
			.setColor(data.color)
			.setTitle(`**Data are based on game v${Genshin_Ver}**\n:arrow_down: Tips for ${data.name[0]} ${data.stars}`)
			.setImage(data.pic_Card);

		return embed;
	}

	moreInfo() {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle(":arrow_down: Materials and Mora Needed For Leveling")
			.setDescription(`For full character list type list in command\`${this.prefix}${this.name} list\``)
			.setImage("https://cdn.discordapp.com/attachments/799595012005822484/799595215521316924/EriB3vTVkAYs0HD.png");
		return embed;
	}

	async listChar(message: Message) {
		let anemo: any[] = [],
			cryo: any[] = [],
			electro: any[] = [],
			geo: any[] = [],
			hydro: any[] = [],
			pyro: any[] = [],
			adaptive: any[] = [],
			total;

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
			.setTitle(`Showing Full Genshin Impact Character List`)
			.addField(`❯\u2000\Upcoming Character`, "- Ayaka [Cryo]\n")
			.setTimestamp();

		const docs = await find_DB_Return("g_Char", {});

		for (let i = 0; i < docs.length; i++) {
			switch (docs[i].type) {
				case "anemo":
					anemo.push(`- ${docs[i].name[0]}`);
					break;
				case "cryo":
					cryo.push(`- ${docs[i].name[0]}`);
					break;
				case "electro":
					electro.push(`- ${docs[i].name[0]}`);
					break;
				case "geo":
					geo.push(`- ${docs[i].name[0]}`);
					break;
				case "hydro":
					hydro.push(`- ${docs[i].name[0]}`);
					break;
				case "pyro":
					pyro.push(`- ${docs[i].name[0]}`);
					break;
				case "adaptive":
					adaptive.push(`- ${docs[i].name[0]}`);
					break;
				default:
					break;
			}
		}

		embed.addField(`❯\u2000\Anemo Character [${anemo.length}]`, anemo.join("\n"), true);
		embed.addField(`❯\u2000\Cryo Character [${cryo.length}]`, cryo.join("\n"), true);
		embed.addField(`❯\u2000\Electro Character [${electro.length}]`, electro.join("\n"), true);
		embed.addField(`❯\u2000\Geo Character [${geo.length}]`, geo.join("\n"), true);
		embed.addField(`❯\u2000\Hydro Character [${hydro.length}]`, hydro.join("\n"), true);
		embed.addField(`❯\u2000\Pyro Character [${pyro.length}]`, pyro.join("\n"), true);
		embed.addField(`❯\u2000\Adaptive Character [${adaptive.length}]`, adaptive.join("\n"), true);

		total = anemo.length + cryo.length + electro.length + geo.length + hydro.length + pyro.length + adaptive.length;

		embed.setDescription(
			`**Data are based on game v${Genshin_Ver}**\nThere are currently over ${total} playable character in genshin impact, each of them (aside from traveller) has their own unique element. There are 6 types of element in genshin impact. Currently Anemo has ${anemo.length} playable character, Cryo has ${cryo.length}, Electro has ${electro.length}, Geo has ${geo.length}, Hydro has ${hydro.length}, and Pyro has ${pyro.length}.`
		);

		return embed;
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send("Invalid input!");
		let pages: any[] = [];

		switch (args.join(" ").toLowerCase()) {
			case "list":
				message.channel.send({ embeds: [await this.listChar(message)] });
				break;

			case "lvlup" || "lvl":
				message.channel.send({ embeds: [this.lvlUp()] });
				break;

			default:
				const docs = await find_DB_Return("g_Char", { name: capitalizeFirstLetter(args.join(" ").toLowerCase()) });
				if (docs.length === 0) return message.channel.send({ embeds: [this.notFound()] });

				pages.push(this.embedCharacter(docs[0]));
				pages.push(this.embedCard(docs[0]));
				pages.push(this.moreInfo());

				paginationEmbed(message, pages);

				break;
		}
	}
};
