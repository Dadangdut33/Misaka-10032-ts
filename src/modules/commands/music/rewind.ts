import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { getInfo } from "ytdl-core";
import { stream } from "play-dl";
import { createAudioResource } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("rewind", {
			categories: "music",
			info: "Rewind the song. Format: \n-`<time in seconds>` -> ex:120\n-`<minutes:seconds>` -> ex: 2:12\n-`<hours:minutes:seconds>` -> ex: 1:2:12",
			usage: `\`${prefix}command <time in seconds>/<minutes:seconds>/<hours:minutes:seconds>\``,
			guildOnly: true,
		});
	}

	fancyTimeFormat(duration: number) {
		// Hours, minutes and seconds
		let hrs = ~~(duration / 3600);
		let mins = ~~((duration % 3600) / 60);
		let secs = ~~duration % 60;

		let ret = "";

		if (hrs > 0) {
			ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
		}

		ret += "" + mins + ":" + (secs < 10 ? "0" : "");
		ret += "" + secs;
		return ret;
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

		// must be playing radio
		if (playerObj.player.state.status !== "playing") return message.reply({ content: `⛔ **Radio is not playing anything!**`, allowedMentions: { repliedUser: false } });

		// get videoInfo
		const videoInfo = await getInfo(playerObj.currentUrl);

		// if live stream, return error
		if (videoInfo.videoDetails.isLiveContent) return message.reply({ content: `⛔ **Cannot seek in live stream!**`, allowedMentions: { repliedUser: false } });

		// input time
		let time = args[0];
		// check if time is in seconds or minutes:seconds or hours:minutes:seconds
		let inputTime = 0;
		if (time.includes(":")) {
			const timeArr = time.split(":");
			if (timeArr.length === 3) {
				const hours = parseInt(timeArr[0]);
				const minutes = parseInt(timeArr[1]);
				const seconds = parseInt(timeArr[2]);
				inputTime = hours * 3600 + minutes * 60 + seconds;
			} else if (timeArr.length === 2) {
				const minutes = parseInt(timeArr[0]);
				const seconds = parseInt(timeArr[1]);
				inputTime = minutes * 60 + seconds;
			}
		} else {
			inputTime = parseInt(time);
		}

		// checks
		if (isNaN(inputTime)) return message.reply({ content: `⛔ **Invalid time!**`, allowedMentions: { repliedUser: false } }); // if not a number
		if (inputTime < 0) return message.reply({ content: `⛔ **Time cannot be negative!**`, allowedMentions: { repliedUser: false } }); // if input negative

		// total rewind time
		let rewindTime = playerObj.seekTime + ~~(playerObj.player.state.playbackDuration / 1000) - inputTime;
		if (rewindTime < 0) rewindTime = 0; // if rewind time is negative, set to 0

		// seek backward
		const streamInfo = await stream(playerObj.currentUrl, { quality: 1250, precache: 1000, seek: rewindTime });
		const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
		playerObj.seekTime = rewindTime;
		playerObj.player.play(resource);

		return message.reply({ content: `⏪ **Rewinded to ${this.fancyTimeFormat(rewindTime)}!**`, allowedMentions: { repliedUser: false } });
	}
};
