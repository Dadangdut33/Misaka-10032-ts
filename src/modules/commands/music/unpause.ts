import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface } from "../../../handler";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("unpause", {
			aliases: ["resume"],
			categories: "music",
			info: "Unpause/resume current radio",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[], { music }: { music: musicSettingsInterface }) {
		// check guild, only allow if in 640790707082231834 or 651015913080094721
		if (message.guild!.id !== "640790707082231834" && message.guild!.id !== "651015913080094721") return message.channel.send("This command is only available in a certain server!");

		const user = message.member!;
		const guild = message.guild!;
		// check if user is in vc or not
		if (!user.voice.channel) {
			return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });
		}

		// check if bot is in vc or not
		if (!getVoiceConnection(guild.id)) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// check playing status
		if (music.player.state.status === "paused") {
			// pause player
			music.player.unpause();

			return message.reply({ content: `▶ **Resumed**`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `⛔ **Music is not paused!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
