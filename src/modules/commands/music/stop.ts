import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface } from "../../../handler";
import { createAudioPlayer, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("stop", {
			categories: "music",
			info: "Stop and clear current radio queue",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[], { musicP }: { musicP: musicSettingsInterface }) {
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

		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			// if no player for guild create one
			musicP.set(guild.id, {
				player: createAudioPlayer({
					behaviors: {
						noSubscriber: NoSubscriberBehavior.Play,
					},
				}),
				currentTitle: "",
				volume: 100, // not used but kept for future use
			});

			playerObj = musicP.get(guild.id)!;
		}

		// stop current music
		if (playerObj.player.state.status === "playing" || playerObj.player.state.status === "paused") {
			playerObj.player.stop();

			return message.reply({ content: `⏹ **Stopped.** currently played radio is now stopped`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `⛔ **No radio is playing!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
