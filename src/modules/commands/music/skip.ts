import { Message, TextChannel } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, StaticState } from "../../../handler";
import { createAudioResource, getVoiceConnection } from "@discordjs/voice";
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

		// skip current music
		if (music.player.state.status === "playing" || music.player.state.status === "paused") {
			// get queue data
			const queueData = await find_DB_Return("music_state", { gid: guild.id });
			if (queueData) {
				const queue = queueData[0].queue;

				const textChannel = message.guild!.channels.cache.get(queueData[0].tc_id) as TextChannel;
				if (queue.length > 0) {
					const nextSong = queue.shift();
					const stream = await play.stream(nextSong.link)!;
					const resource = createAudioResource(stream.stream, { inlineVolume: true, inputType: stream.type });

					staticState.setAudioLink(nextSong.link);
					staticState.setCurrentAudio(resource);
					music.player.play(resource);

					// update queue data
					edit_DB("music_state", { gid: guild.id }, { $set: { queue: queue } });

					// send message to channel
					textChannel.send({ embeds: [{ title: `⏩ Skipped current song!`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: "RANDOM" }] });
				} else {
					// check if state is playing the stop player
					if (music.player.state.status === "playing") {
						music.player.stop();
					}

					staticState.setLocalStatus("stopped");

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
