import { Message, TextChannel } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { AudioPlayerStatus, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { updateOne_Collection, find_DB_Return, insert_collection } from "../../../utils";
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

	async run(message: Message, args: string[], { musicP, addNewPlayer }: { musicP: musicSettingsInterface; addNewPlayer: addNewPlayerArgsInterface }) {
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
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}

		// skip current music
		if (playerObj.player.state.status === "playing" || playerObj.player.state.status === "paused") {
			// if on auto
			if (playerObj.auto) {
				// set player state as idle
				playerObj.player.state = { status: AudioPlayerStatus.Idle }; // this will be handled in handler to play next song
				return;
			}

			// get queue data
			const queueData = await find_DB_Return("music_state", { gid: guild.id });
			if (queueData.length > 0) {
				const queue = queueData[0].queue;

				const textChannel = message.guild!.channels.cache.get(queueData[0].tc_id) as TextChannel;
				if (queue.length > 0) {
					const nextSong = queue.shift();
					const stream = await play.stream(nextSong.link, { quality: 1250, precache: 1000 })!;
					const resource = createAudioResource(stream.stream, { inlineVolume: true, inputType: stream.type });

					playerObj.player.play(resource);
					playerObj.currentTitle = nextSong.title;
					playerObj.currentUrl = nextSong.link;
					playerObj.seekTime = 0;
					playerObj.query = nextSong.query;

					// update queue data
					updateOne_Collection("music_state", { gid: guild.id }, { $set: { queue: queue } });

					// send message to channel
					textChannel.send({ embeds: [{ title: `⏩ Skipped current song!`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: "RANDOM" }] });
				} else {
					// check if state is playing then stop player
					const wasLoop = playerObj.loop;
					if (playerObj.player.state.status === "playing") {
						playerObj.player.stop();
						playerObj.loop = false;
					}

					// update queue data
					updateOne_Collection("music_state", { gid: guild.id }, { $set: { queue: [] } });

					// send message telling finished playing all songs
					textChannel.send({ embeds: [{ title: `⏩ Skipped current song!`, description: `Queue is now empty${wasLoop ? `. Loop mode disabled automatically` : `.`}`, color: "RANDOM" }] });
				}
			} else {
				// queue not set in db
				insert_collection("music_state", { gid: guild.id, vc_id: user.voice.channel.id, tc_id: message.channel.id, queue: [] });
			}
		} else {
			return message.reply({ content: `⛔ **No radio is playing!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
