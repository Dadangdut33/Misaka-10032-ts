import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { splitBar } from "string-progressbar";
import { getInfo } from "ytdl-core";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("nowplaying", {
			aliases: ["np"],
			categories: "music",
			info: "Get now playing music info and duration",
			usage: `\`${prefix}command/alias\``,
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

	fancyTimeFormatMs(duration: number) {
		// Hours, minutes and seconds
		let hrs = ~~(duration / 3600000);
		let mins = ~~((duration % 3600000) / 60000);
		let secs = ~~((duration % 60000) / 1000);

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
		// check playing status
		if (playerObj.player.state.status === "playing") {
			const videoInfo = await getInfo(playerObj.currentUrl);
			const total = parseInt(videoInfo.videoDetails.lengthSeconds);
			const current = ~~(playerObj.player.state.playbackDuration / 1000);

			let loadBar: string[] = [];
			if (!videoInfo.videoDetails.isLiveContent) {
				loadBar = splitBar(total, current, 33);
				loadBar.pop(); // remove last array element (its a number thingy)
			}

			return message.reply({
				embeds: [
					{
						author: { name: `🎶 ${playerObj.currentTitle} ${!videoInfo.videoDetails.isLiveContent ? "🎵" : "(📺 Live)"}`, url: playerObj.currentUrl },
						description: `${
							!videoInfo.videoDetails.isLiveContent
								? `${this.fancyTimeFormatMs(playerObj.player.state.playbackDuration)}/${this.fancyTimeFormat(total)}\n[${loadBar.join("")}]`
								: `Has been running for ${this.fancyTimeFormatMs(playerObj.player.state.playbackDuration)}`
						} `,
						fields: [
							{
								name: "Uploader",
								value: `[${videoInfo.videoDetails.author.name}](${videoInfo.videoDetails.ownerProfileUrl})`,
								inline: true,
							},
							{
								name: "Views / Likes",
								value: `${parseInt(videoInfo.videoDetails.viewCount).toLocaleString()} / ${videoInfo.videoDetails.likes ? videoInfo.videoDetails.likes.toLocaleString() : 0}`,
								inline: true,
							},
							{
								name: "Upload date",
								value: `${videoInfo.videoDetails.uploadDate}`,
								inline: true,
							},
						],
						color: 0x00ff00,
					},
				],
				allowedMentions: { repliedUser: false },
			});
		} else {
			return message.reply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
