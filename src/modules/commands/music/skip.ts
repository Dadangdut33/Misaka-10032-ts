import { Message, TextChannel } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface } from "../../../handler";
import { createAudioResource, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior } from "@discordjs/voice";
import { edit_DB, find_DB_Return } from "../../../utils";
import play from "play-dl";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("skip", {
			categories: "music",
			info: "Skip current song",
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

		// skip current music
		if (playerObj.player.state.status === "playing" || playerObj.player.state.status === "paused") {
			// get queue data
			const queueData = await find_DB_Return("music_state", { gid: guild.id });
			if (queueData) {
				const queue = queueData[0].queue;

				const textChannel = message.guild!.channels.cache.get(queueData[0].tc_id) as TextChannel;
				if (queue.length > 0) {
					const nextSong = queue.shift();
					const stream = await play.stream(nextSong.link)!;
					const resource = createAudioResource(stream.stream, { inlineVolume: true, inputType: stream.type });

					playerObj.player.play(resource);

					// update queue data
					edit_DB("music_state", { gid: guild.id }, { $set: { queue: queue } });

					// send message to channel
					textChannel.send({ embeds: [{ title: `⏩ Skipped current song!`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: "RANDOM" }] });
				} else {
					// check if state is playing the stop player
					if (playerObj.player.state.status === "playing") playerObj.player.stop();

					// update queue data
					edit_DB("music_state", { gid: guild.id }, { $set: { queue: [] } });

					// send message telling finished playing all songs
					textChannel.send({ embeds: [{ description: "Finished playing all songs", color: "RANDOM" }] });
				}
			}
		} else {
			return message.reply({ content: `⛔ **No radio is playing!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
