import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("qr", {
			categories: "tool",
			info: "Convert text (Can be link or just plain text) to QR code",
			usage: `${prefix}command/alias <link/text>`,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send("Please enter a valid url or text!");

		const url = `http://api.qrserver.com/v1/create-qr-code/?data=${args.join("+")}&size=400x400`;
		const embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`Original Text\`\`\`${args.join(" ")}\`\`\``)
			.setTitle(`:arrow_down: QR Code Generated`)
			.setImage(url);

		return message.channel.send(embed);
	}
};
