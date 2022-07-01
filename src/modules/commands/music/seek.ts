import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import ytdl from "ytdl-core";
import { stream } from "play-dl";
import { createAudioResource } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("seek", {
			categories: "music",
			info: "Seek time in current radio. Format: \n-`<time in seconds>` Ex:120\n-`<minutes:seconds>` Ex: 2:12\n-`<hours:minutes:seconds>` Ex: 1:2:12",
			usage: `\`${prefix}command <time in seconds>/<minutes:seconds>/<hours:minutes:seconds>\``,
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
		if (!guild.me?.voice.channel) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}

		if (args.length === 0) return message.reply({ content: `⛔ **No time specified!**`, allowedMentions: { repliedUser: false } });

		// get videoInfo
		const videoInfo = await ytdl.getInfo(playerObj.currentUrl);

		// if live stream, return error
		if (videoInfo.videoDetails.isLiveContent) return message.reply({ content: `⛔ **Cannot seek in live stream!**`, allowedMentions: { repliedUser: false } });

		// seek time
		const time = args[0];
		// check if time is in seconds or minutes:seconds or hours:minutes:seconds
		let seekTime = 0;
		if (time.includes(":")) {
			const timeArr = time.split(":");
			if (timeArr.length === 3) {
				const hours = parseInt(timeArr[0]);
				const minutes = parseInt(timeArr[1]);
				const seconds = parseInt(timeArr[2]);
				seekTime = hours * 3600 + minutes * 60 + seconds;
			} else if (timeArr.length === 2) {
				const minutes = parseInt(timeArr[0]);
				const seconds = parseInt(timeArr[1]);
				seekTime = minutes * 60 + seconds;
			}
		} else {
			seekTime = parseInt(time);
		}

		if (seekTime > parseInt(videoInfo.videoDetails.lengthSeconds)) return message.reply({ content: `⛔ **Time cannot exceed video time!**`, allowedMentions: { repliedUser: false } });

		if (seekTime < 0) return message.reply({ content: `⛔ **Time cannot be negative!**`, allowedMentions: { repliedUser: false } });

		// seek
		const streamInfo = await stream(playerObj.currentUrl, { quality: 1250, precache: 1000, seek: seekTime });
		const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
		playerObj.seekTime = seekTime;
		playerObj.player.play(resource);

		return message.reply({ content: `✅ **Seeked to ${seekTime} seconds!**`, allowedMentions: { repliedUser: false } });
	}
};
