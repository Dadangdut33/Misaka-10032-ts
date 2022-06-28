import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { find_DB_Return, paginationEmbed } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("queue", {
			aliases: ["q"],
			categories: "music",
			info: "Check music queues",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		const guild = message.guild!;

		// check if user is in vc or not
		const queueData = await find_DB_Return("music_state", { gid: guild.id });

		// if error db
		if (!queueData) return message.reply({ content: "⛔ **Error finding music state in database!** You can report this issue to my creator.", allowedMentions: { repliedUser: false } });

		// get queue data
		const data = queueData[0];
		let maxShown = 10;
		let loopAmount = Math.ceil(data.queue.length / maxShown); // loop amount

		if (data.queue.length <= maxShown) {
			const embedData = new MessageEmbed()
				.setColor("#0099ff")
				.setThumbnail("https://i.imgur.com/FWKIR7N.png")
				.setAuthor({ name: "Queue for " + guild.name, iconURL: guild.iconURL({ format: "png", size: 2048 }) as string })
				.setDescription(data.queue.length > 0 ? data.queue.map((song: any, index: number) => `${index + 1}. [${song.title}](${song.link})`).join("\n") : "Queue is currently empty!");

			return message.channel.send({ embeds: [embedData] });
		} else {
			const embedLists = [];

			for (let i = 0; i < loopAmount; i++) {
				const embedData = new MessageEmbed()
					.setColor("#0099ff")
					.setAuthor({ name: "Queue for " + guild.name, iconURL: guild.iconURL({ format: "png", size: 2048 }) as string })
					.setThumbnail("https://i.imgur.com/FWKIR7N.png")
					.setDescription(
						data.queue
							.map((song: any, index: number) => `${index + 1}. [${song.title}](${song.link})`)
							.slice(i * 25, (i + 1) * 25)
							.join("\n")
					);

				embedLists.push(embedData);
			}

			paginationEmbed(message, embedLists);
		}
	}
};
