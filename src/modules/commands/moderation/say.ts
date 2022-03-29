import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("say", {
			categories: "moderation",
			info: "Says your input via the bot, only usable by admin and mods",
			usage: `\`${prefix}say [embed] <content>\``,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[]) {
		message.delete();
		if (args.length < 1) return message.reply("Nothing to say?").then((msg) => msg.delete({ timeout: 5000 }));

		if (args[0].toLowerCase() === "embed") {
			const embed = new MessageEmbed().setAuthor(message.author.username, message.author.displayAvatarURL()).setDescription(args.slice(1).join(" ")).setColor("#000");

			message.channel.send(embed);
		} else {
			message.channel.send(args.join(" "));
		}
	}
};
