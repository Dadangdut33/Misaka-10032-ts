import { Message, MessageEmbed, DiscordAPIError } from "discord.js";
import moment from "moment-timezone";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("tagspoiler", {
			aliases: ["ts"],
			categories: "moderation",
			info: "Tag spoiler a message by using the bot, only usable by admin and mods",
			usage: `${prefix}command/alias <message id> <reason>`,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	invalidArgs() {
		let embed = new MessageEmbed().setColor("#000000").setDescription(`Wrong Arguments Provided!`);

		return embed;
	}

	errorID() {
		let embed = new MessageEmbed().setColor("#000000").setDescription(`Invalid Message ID provided. Please provide a correct one!`);

		return embed;
	}

	noReason() {
		let embed = new MessageEmbed().setColor("#000000").setDescription(`Please provide a reason!`);

		return embed;
	}

	async run(message: Message, args: string[]) {
		message.delete();

		if (args.length < 1) return message.channel.send({ embeds: [this.invalidArgs()] }).then((msg) => setTimeout(() => msg.delete(), 5000));

		if (isNaN(parseInt(args[0]))) return message.channel.send({ embeds: [this.errorID()] }).then((msg) => setTimeout(() => msg.delete(), 5000));

		if (!args[1]) return message.channel.send({ embeds: [this.noReason()] }).then((msg) => setTimeout(() => msg.delete(), 5000));

		let reason = args.slice(1).join(" ");
		let author = message.author;

		message.channel.messages
			.fetch(args[0])
			.then((message) => {
				message.delete();

				let msgToTheAuthor = `${message.author} **__Your Message Has Been Marked as Spoiler__**`;
				let attachmentName = message.attachments.map((attachment) => attachment.name),
					attachmentURL = message.attachments.map((attachment) => attachment.proxyURL),
					height = message.attachments.map((attachment) => attachment.height),
					width = message.attachments.map((attachment) => attachment.width),
					size = message.attachments.map((attachment) => attachment.size),
					attachmentExists = attachmentName.length > 0;

				let embed = new MessageEmbed()
					.setTitle(`**Reason:** ${reason.trim()}`)
					.setDescription(`**Message Content Below:**\n${message.content ? `||${message.content.replace(/\||```/g, "")}||` : "-"}`);

				// send attachment
				if (attachmentExists) {
					for (let i = 0; i < attachmentName.length; i++) {
						embed.addField(`Attachment ${attachmentName[i]}`, `${attachmentURL[i]}\**>> ${width[i]} x ${height[i]}** (${size[i]} Bytes)`, false);
					}
				}

				embed
					.addField(`Go To`, `[Message Position](https://discord.com/channels/${message.guild!.id}/${message.channel.id}/${message.id})`, false)
					.addField(
						`Reminder`,
						`Please use the tag spoiler if your message contains spoiler so this won't happen again in the future. Example of how to use it -> \`||spoiler here||\``,
						false
					)
					.addField(`Message Sent At`, moment(message.createdTimestamp).tz("Asia/Jakarta").format("dddd, D-M-YY (HH:mm:ss)"), true)
					.addField(`Message Author`, message.author.toString(), true)
					.addField(`Marked by`, author.toString(), true)
					.setFooter({ text: `Format Date: D-M-Y • GMT + 7` })
					.setTimestamp();

				return message.channel.send({ content: msgToTheAuthor, embeds: [embed] });
			})
			.catch((error) => {
				if (error instanceof DiscordAPIError) {
					let embed = new MessageEmbed().setColor("#000000").setDescription(`Invalid Message ID provided. Please provide a correct one!`);

					return message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 5000));
				} else {
					let embed = new MessageEmbed().setColor("#000000").setDescription(`Caught Error: ${error}`);

					return message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 5000));
				}
			});
	}
};
