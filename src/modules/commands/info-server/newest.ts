import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";

module.exports = class extends Command {
	constructor() {
		super("newest", {
			aliases: [],
			categories: "info-server",
			info: "List the newest member (Max 25)",
			usage: `\`${prefix}newest\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) {
			//Get data
			var memberList: string[] = [];
			memberList = getMember();

			//Sort it and reverse it
			memberList.sort().reverse();

			for (var i = 0; i < (memberList.length > 25 ? 25 : memberList.length); i++) {
				memberList[i] = memberList[i].replace(/[0-9]+\s,,/g, `[${i + 1}]`);
			}

			let embed = new MessageEmbed()
				.setTitle(`Showing newest member in ${message.guild!.name} (Max shown 25)`)
				.setDescription(`${memberList.join("\n")}`)
				.setAuthor(message.guild!.name, message.guild!.iconURL({ format: "jpg", size: 2048 })!, `https://discord.com/channels/${message.guild!.id}`)
				.setFooter(`Format date D-M-Y • Time are in GMT + 7`)
				.setTimestamp();

			message.channel.send(embed);
		}

		function getMember() {
			return message.guild!.members.cache.map((GuildMember) => {
				var today = moment().tz("Asia/Jakarta");
				var age = today.valueOf() - GuildMember.joinedAt!.getTime();

				return `${GuildMember.joinedTimestamp} ,, ${moment(GuildMember.joinedAt).tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")} - <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
			});
		}
	}
};
