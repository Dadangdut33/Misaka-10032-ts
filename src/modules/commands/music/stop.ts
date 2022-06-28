import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, StaticState } from "../../../handler";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("stop", {
			categories: "music",
			info: "Stop and clear current radio queue",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[], { music, staticState }: { music: musicSettingsInterface; staticState: StaticState }) {
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

		// stop current music
		if (music.player.state.status === "playing" || music.player.state.status === "paused") {
			staticState.setLocalStatus("stopped");
			music.player.stop();

			return message.reply({ content: `⏹ **Stopped.** currently played radio is now stopped`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `⛔ **No radio is playing!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
