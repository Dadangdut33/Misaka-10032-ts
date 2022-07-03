import { MessageEmbed, Message } from "discord.js";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("oldest", {
			aliases: [],
			categories: "info-server",
			info: "List the oldest member (Max 25)",
			usage: `\`${prefix}oldest\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		//Get data
		let memberList: string[] = getMember();

		//Sort it
		memberList.sort();

		for (let i = 0; i < (memberList.length > 25 ? 25 : memberList.length); i++) {
			memberList[i] = memberList[i].replace(/[0-9]+\s,,/g, `[${i + 1}]`);
		}

		let embed = new MessageEmbed()
			.setTitle(`Showing oldest member in ${message.guild!.name} (Max shown 25)`)
			.setDescription(`${memberList.join("\n")}`)
			.setAuthor({ name: message.guild!.name, iconURL: message.guild!.iconURL({ format: "jpg", size: 2048 })!, url: `https://discord.com/channels/${message.guild!.id}` })
			.setFooter({ text: `Format date D-M-Y • Time are in GMT + 7` })
			.setTimestamp();

		return message.channel.send({ embeds: [embed] });

		function getMember() {
			return message.guild!.members.cache.map((GuildMember) => {
				let today = moment().tz("Asia/Jakarta");
				let age = today.valueOf() - GuildMember.joinedAt!.getTime();

				return `${GuildMember.joinedTimestamp} ,, ${moment(GuildMember.joinedAt).tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")} - <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
			});
		}
	}
};
