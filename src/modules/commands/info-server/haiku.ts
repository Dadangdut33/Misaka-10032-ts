import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { find_DB_Return, paginationEmbed } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("haikutop", {
			aliases: ["tophaiku", "leaderboard"],
			categories: "info-server",
			info: "Get server's top haiku poet (a person who has written the most haiku)",
			usage: `\`${prefix}command\``,
			guildOnly: true,
		});
	}

	async run(message: Message) {
		const { guild } = message;
		const getData = await find_DB_Return("haiku", { guildId: guild?.id });

		if (getData.length === 0) {
			let embed = new MessageEmbed()
				.setAuthor({
					name: `Top haiku poet(s) in ${message.guild!.name}`,
					iconURL: message.guild!.iconURL({ format: "jpg", size: 2048 })!,
					url: `https://discord.com/channels/${message.guild!.id}`,
				})
				.setDescription(`No one has accidentaly written any haiku yet.`);

			return message.channel.send({ embeds: [embed] });
		}

		let loopAmount = Math.ceil(getData.length / 25),
			embedList: MessageEmbed[] = [];

		for (let i = 0; i < loopAmount; i++) {
			const poetData = getData.slice(i * 25, (i + 1) * 25).map((value, i) => {
				return `${i + 1}. <@${value.author}> (${value.count} haiku)`;
			});

			let embed = new MessageEmbed()
				.setAuthor({
					name: `Top haiku poet(s) in ${message.guild!.name}`,
					iconURL: message.guild!.iconURL({ format: "jpg", size: 2048 })!,
					url: `https://discord.com/channels/${message.guild!.id}`,
				})
				.setDescription(`${poetData.join("\n")}`)
				.setFooter({ text: `Page ${i + 1}/${loopAmount} | There are a total of ${getData.length} poet(s) in this server` });

			embedList.push(embed);
		}

		paginationEmbed(message, embedList, ["⏪", "⏩", "❌"], 300000, true);
	}
};
