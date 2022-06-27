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
		// check guild, only allow if in 640790707082231834 or 651015913080094721
		if (message.guild!.id !== "640790707082231834" && message.guild!.id !== "651015913080094721") return message.channel.send("This command is only available in a certain server!");

		const guild = message.guild!;

		// check if user is in vc or not
		const queueData = await find_DB_Return("music_state", { gid: guild.id });

		// if no queue data
		if (!queueData) {
			const embed = new MessageEmbed()
				.setColor("#0099ff")
				.setThumbnail("https://i.imgur.com/FWKIR7N.png")
				.setAuthor({ name: "Queue for " + guild.name, iconURL: guild.iconURL({ format: "png", size: 2048 }) as string })
				.setDescription("Queue is currently empty!");

			return message.channel.send({ embeds: [embed] });
		}

		const data = queueData[0];

		// loop amount
		let loopAmount = Math.ceil(data.queue.length / 10);

		// if queue is less than 25
		if (data.queue.length < 25) {
			const embedData = new MessageEmbed()
				.setColor("#0099ff")
				.setThumbnail("https://i.imgur.com/FWKIR7N.png")
				.setAuthor({ name: "Queue for " + guild.name, iconURL: guild.iconURL({ format: "png", size: 2048 }) as string })
				.setDescription(data.queue.map((song: any, index: number) => `${index + 1}. [${song.title}](${song.link})`).join("\n"));

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
