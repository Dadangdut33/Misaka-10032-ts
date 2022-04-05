import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed, find_DB_Return, capitalizeFirstLetter } from "../../../utils/functions";
import { Genshin_Ver } from "../../../config.json";
import moment from "moment-timezone";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("gday", {
			categories: "genshin",
			info: "Gives information about material that can be obtained on a certain day in Genshin Impact.",
			usage: `\`${prefix}command <day/today>\``,
			guildOnly: true,
		});
	}

	infoInvalid() {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle("Please enter a valid day!")
			.setDescription(
				"Day provided can be day name in english, it's abbreviations, number 1-7 (Monday start on 1), and also day name in Indonesia.\n\nYou can also type `today` to see today's farm and all to see the farm details on every day"
			)
			.setTimestamp();

		return embed;
	}

	dataCharsToEmbed(data: any, message: Message) {
		let forsaken_Rift = Array.from(data)
			.filter((filtered: any) => filtered.domain == "Forsaken Rift")
			.map((get: any) => `\`${get.name[0]}\``);

		let farm_Type_1 = Array.from(data)
			.filter((filtered: any) => filtered.domain == "Forsaken Rift")
			.map((get: any) => get.book);

		let taishan_Mansion = Array.from(data)
			.filter((filtered: any) => filtered.domain == "Taishan Mansion")
			.map((get: any) => `\`${get.name[0]}\``);

		let farm_Type_2 = Array.from(data)
			.filter((filtered: any) => filtered.domain == "Taishan Mansion")
			.map((get: any) => get.book);

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL()}`)
			.setTitle(`\`${data[0].fields.farmDay}\` Farm Guide`)
			.setDescription(`**Data are based on game v${Genshin_Ver}**\nBelow are list of characters or weapons that can get materials on the specified days`)
			.addField(`❯\u2000\Forsaken Rift (${farm_Type_1[0]}) [${forsaken_Rift.length}]:`, forsaken_Rift.join(`, `), false)
			.addField(`❯\u2000\Taishan Mansion (${farm_Type_2[0]}) [${taishan_Mansion.length}]:`, taishan_Mansion.join(`, `), false)
			.addField(
				`❯\u2000\Search on Wiki`,
				`• [${farm_Type_1[0]}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_1[0]})\n• [${farm_Type_2[0]}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_2[0]})`
			)
			.setTimestamp();

		return embed;
	}

	dataWeaponsToEmbed(data: any, message: Message) {
		let cecilia_Garden: any = Array.from(data).filter((filtered: any) => filtered.domain == "Cecilia Garden");

		let farm_Type_1 = Array.from(data)
			.filter((filtered: any) => filtered.domain == "Cecilia Garden")
			.map((get: any) => get.farm_Get);

		let hidden_Palace: any = Array.from(data).filter((filtered: any) => filtered.domain == "Hidden Palace of Lianshan Formula");

		let farm_Type_2 = Array.from(data)
			.filter((filtered: any) => filtered.domain == "Hidden Palace of Lianshan Formula")
			.map((get: any) => get.farm_Get);

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL()}`)
			.setTitle(`\`${data[0].farm_Day}\` Farm Guide`)
			.setDescription(`**Data are based on game v${Genshin_Ver}**\nBelow are list of characters or weapons that can get materials on the specified days`)
			.addField(`❯\u2000\Cecilia Garden (${farm_Type_1[0]}) [${cecilia_Garden[0].weapons.length}]:`, cecilia_Garden[0].weapons.map((x: any) => `\`${x}\``).join(", "), false)
			.addField(
				`❯\u2000\Hidden Palace of Lianshan Formula (${farm_Type_2[0]}) [${hidden_Palace[0].weapons.length}]:`,
				hidden_Palace[0].weapons.map((x: any) => `\`${x}\``).join(", "),
				false
			)
			.addField(
				`❯\u2000\Search on Wiki`,
				`• [${farm_Type_1[0]}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_1[0].replace(/\s/g, "+")})\n• [${
					farm_Type_2[0]
				}](https://genshin-impact.fandom.com/wiki/Special:Search?query=${farm_Type_2[0].replace(/\s/g, "+")})`
			)
			.setTimestamp();

		return embed;
	}

	sunday(message: Message) {
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor(`Requested by ${message.author.username}`, `${message.author.displayAvatarURL()}`)
			.setTitle("Sunday Farm Guide")
			.setDescription("You can farm for every material on sunday!")
			.setTimestamp();

		return embed;
	}

	async run(message: Message, args: string[]) {
		let date = moment.tz("Asia/Jakarta"),
			pages: MessageEmbed[] = [],
			isToday = false,
			today = date.isoWeekday();

		if (!args[0]) return message.channel.send(this.infoInvalid());

		if (["sunday", "sun", "minggu", "7"].includes(args.join(" ").toLowerCase())) return message.channel.send(this.sunday(message));

		if (args[0].toLowerCase() === "today") {
			isToday = true;
			if (today === 7) return message.channel.send(this.sunday(message));
		}

		const dataCharToday = await find_DB_Return("g_Char", { farm_Index: isToday ? today.toString() : capitalizeFirstLetter(args.join(" ").toLowerCase()) });
		if (dataCharToday.length === 0) return message.channel.send(this.infoInvalid());

		const dataWeaponToday = await find_DB_Return("g_Weapon", { farm_Index: isToday ? today.toString() : capitalizeFirstLetter(args.join(" ").toLowerCase()) });
		if (dataWeaponToday.length === 0) return message.channel.send(this.infoInvalid());

		pages.push(this.dataCharsToEmbed(dataCharToday, message));
		pages.push(this.dataWeaponsToEmbed(dataWeaponToday, message));

		paginationEmbed(message, pages);
	}
};
