import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("pause", {
			categories: "music",
			info: "Disconnect from voice channel and stop music",
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
		if (!guild.me?.voice.channel) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// check playing status
		if (music.player.state.status === "playing") {
			// pause player
			music.player.pause();

			return message.reply({ content: `⏸ **Paused**`, allowedMentions: { repliedUser: false } });
		} else if (music.player.state.status === "paused" || music.player.state.status === "autopaused") {
			return message.reply({ content: `⛔ **Already paused!**`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
