import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("leave", {
			aliases: ["disconnect"],
			categories: "music",
			info: "Disconnect from voice channel",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		// check guild, only allow if in 640790707082231834 or 651015913080094721
		if (message.guild!.id !== "640790707082231834" && message.guild!.id !== "651015913080094721") return message.channel.send("This command is only available in a certain server!");

		const user = message.member!;
		const guild = message.guild!;

		// check if user is in vc or not
		if (!user.voice.channel) {
			return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });
		}

		const vc = user.voice.channel;

		// check if bot is in vc or not
		if (!guild.me?.voice.channel) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// leave vc
		if (getVoiceConnection(guild.id)) getVoiceConnection(guild.id)!.destroy();
		else guild.me?.voice.disconnect();

		return message.reply({ content: `👌 **Left** \`${vc.name}\``, allowedMentions: { repliedUser: false } });
	}
};
