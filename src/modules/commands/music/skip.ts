import { Message, TextChannel } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { edit_DB, find_DB_Return, insert_DB_One } from "../../../utils";
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
			} else {
				insert_DB_One("music_state", { gid: guild.id, vc_id: user.voice.channel.id, tc_id: message.channel.id, queue: [] });
			}
		} else {
			return message.reply({ content: `⛔ **No radio is playing!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
