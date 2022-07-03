import { MessageEmbed, Message } from "discord.js";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("oldest", {
			categories: "info-server",
			info: "List member from the oldest member (25 per embeds)",
			usage: `\`${prefix}command\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let index = 0;
		const memberFromOldest = message
			.guild!.members.cache.sort((a, b) => a.joinedTimestamp! - b.joinedTimestamp!)
			.map((GuildMember) => {
				let age = moment().tz("Asia/Jakarta").valueOf() - GuildMember.joinedAt!.getTime();
				index++;
				return `${index} <t:${~~(moment(GuildMember.joinedAt).tz("Asia/Jakarta").valueOf() / 1000)}:R> - <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
			});

		let loopAmount = Math.ceil(memberFromOldest.length / 25),
			embedList = [];

		for (let i = 0; i < loopAmount; i++) {
			let embed = new MessageEmbed()
				.setTitle(`Showing oldest member in ${message.guild!.name}`)
				.setDescription(`${memberFromOldest.slice(i * 25, (i + 1) * 25).join("\n")}`)
				.setAuthor({ name: message.guild!.name, iconURL: message.guild!.iconURL({ format: "jpg", size: 2048 })!, url: `https://discord.com/channels/${message.guild!.id}` })
				.setTimestamp();

			embedList.push(embed);
		}

		paginationEmbed(message, embedList);
	}
};
