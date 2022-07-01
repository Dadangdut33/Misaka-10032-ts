import { Message, VoiceBasedChannel, Guild } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { getVoiceConnection, joinVoiceChannel, DiscordGatewayAdapterCreator, createAudioResource } from "@discordjs/voice";
import { getInfo, validateURL, videoInfo } from "ytdl-core";
import { stream, search } from "play-dl";
import { edit_DB, find_DB_Return, insert_DB_One } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("play", {
			aliases: ["p"],
			categories: "music",
			info: "Play a yt video/live stream. Available predefined radio ('[' and ']' is mandatory):\n- [**[lofi]**](https://youtu.be/5qap5aO4i9A) - lofi hip hop radio - beats to relax/study to\n- [**[animelofi]**](https://youtu.be/WDXPJWIgX-o) - anime lofi hip hop radio - 24/7 chill lofi remixes of anime\n- [**[piano]**](https://youtu.be/xWRHTpqQMGM) - Beautiful Piano Music 24/7 - Study Music, Relaxing Music, Sleep Music, Meditation Music\n- [**[phonk]**](https://youtu.be/Ax4Y5n4f5K8) - 24/7 TRAPPIN IN JAPAN // phonk / lofi hip hop / vapor trap Radio.\n\n**Note:** Bot will not leave unless prompted to leave.",
			usage: `\`${prefix}command <search YT video name/valid YT Link/[lofi]/[animelofi]/[piano]/[phonk]>\``,
			guildOnly: true,
		});
	}

	joinVcChannel(message: Message, vc: VoiceBasedChannel, guild: Guild) {
		let con;
		try {
			con = joinVoiceChannel({
				channelId: vc.id,
				guildId: guild.id,
				adapterCreator: guild.voiceAdapterCreator! as DiscordGatewayAdapterCreator,
			});
		} catch (error) {
			message.reply({ content: `⛔ **An error occured!**\n${error}`, allowedMentions: { repliedUser: false } });
		} finally {
			return con;
		}
	}

	sendVideoInfo(message: Message, title: string, videoInfo: videoInfo) {
		message.channel.send({
			embeds: [
				{
					title: `${title} ${!videoInfo.videoDetails.isLiveContent ? "🎵" : "📺"}`,
					description: `**[${videoInfo.videoDetails.title}](${videoInfo.videoDetails.video_url})** by [${videoInfo.videoDetails.author.name}](${videoInfo.videoDetails.ownerProfileUrl})`,
					fields: [
						{
							name: "Live / Duration",
							value: `${videoInfo.videoDetails.isLiveContent ? "Yes" : "No"} / ${videoInfo.videoDetails.lengthSeconds} seconds`,
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
					image: {
						url: `https://img.youtube.com/vi/${videoInfo.videoDetails.videoId}/hqdefault.jpg`,
					},
				},
			],
		});
	}

	async getVideoResource(link: string) {
		const streamInfo = await stream(link, { quality: 1250, precache: 1000 })!;
		return createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });
	}

	async run(message: Message, args: string[], { musicP, addNewPlayer }: { musicP: musicSettingsInterface; addNewPlayer: addNewPlayerArgsInterface }) {
		const radioDict: any = {
			"[lofi]": "https://youtu.be/5qap5aO4i9A",
			"[animelofi]": "https://youtu.be/WDXPJWIgX-o",
			"[piano]": "https://youtu.be/xWRHTpqQMGM",
			"[phonk]": "https://youtu.be/Ax4Y5n4f5K8",
		};

		// get data
		const user = message.member!;
		const guild = message.guild!;

		// check if user is in vc or not
		if (!user.voice.channel) return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });

		let link: string = "";
		// check if args is a predefined radio
		if (radioDict[args[0]]) link = radioDict[args[0]];
		else {
			// check if link or not
			if (validateURL(args[0])) link = args[0];
			else {
				const res = await search(args.join(" "), { limit: 5, source: { youtube: "video" } });

				if (!res) return message.reply({ content: "⛔ **No results found!**", allowedMentions: { repliedUser: false } });

				message.channel.send({
					embeds: [
						{
							color: 0x00ff00,
							author: { name: "Please choose from the list (⏳30)" },
							description: res.map((data, index) => `${index + 1}. [${data.title}](${data.url})`).join("\n"),
							footer: { text: "Type the number of the video you want to play.Type 'cancel' to cancel" },
						},
					],
				});

				try {
					const m = await message.channel.awaitMessages({ filter: (m: Message) => m.author.id === message.author.id, max: 1, time: 30000, errors: ["time"] }).catch();

					if (!m.first()) return message.reply({ content: "⛔ **Cancelled because input not provided by user!**", allowedMentions: { repliedUser: false } });
					const num = parseInt(m.first()!.content);
					if (isNaN(num))
						return message.reply({ content: num.toString().includes("cancel") ? "⛔ **Cancelled!**" : "⛔ **Incorrect input!**", allowedMentions: { repliedUser: false } });

					if (num > res.length || num < 1) return message.reply({ content: "⛔ **Incorrect input!**", allowedMentions: { repliedUser: false } });
					link = res[num - 1].url;
				} catch (error) {
					message.reply({ content: `⛔ **Cancelled because input not provided by user!**\n`, allowedMentions: { repliedUser: false } });
					return;
				}
			}
		}

		// vc connection
		const vc = user.voice.channel;
		let voiceConnection = getVoiceConnection(guild.id);

		// if bot not in vc join vc
		if (!getVoiceConnection(guild.id)) voiceConnection = this.joinVcChannel(message, vc, guild); // join vc
		else {
			// if bot is in vc but is not the same as user vc tell user to use move command first
			if (guild.me?.voice.channel?.id !== vc.id) {
				return message.reply({
					content: "⚠ Bot is already connected to another voice channel. Use the `move` command first to move the bot to another channel",
					allowedMentions: { repliedUser: false },
				});
			}
		}

		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}

		const mReply = await message.reply({ content: `🎶 **Loading** \`${link}\``, allowedMentions: { repliedUser: false } });
		try {
			const videoInfo = await getInfo(link);
			mReply.edit({ content: `🎶 **Loading** \`${videoInfo.videoDetails.title}\`` });

			// get video resource
			const queueItem = {
				type: videoInfo.videoDetails.isLiveContent ? "live" : "video",
				title: videoInfo.videoDetails.title,
				link: link,
			};

			playerObj.currentTitle = queueItem.title;
			playerObj.currentUrl = queueItem.link;
			playerObj.seekTime = 0;

			// 1st play
			if (playerObj.player.state.status !== "playing") {
				// connect
				const resource = await this.getVideoResource(link);
				voiceConnection!.subscribe(playerObj.player);
				playerObj.player.play(resource);

				// check exist in db or not
				let checkExist = await find_DB_Return("music_state", { gid: guild.id });
				if (checkExist.length === 0) insert_DB_One("music_state", { gid: guild.id, vc_id: vc.id, tc_id: message.channel.id, queue: [] });
				else edit_DB("music_state", { gid: guild.id }, { $set: { vc_id: vc.id, tc_id: message.channel.id } });

				// send info
				this.sendVideoInfo(message, "Now Playing", videoInfo);
				mReply.edit({ content: `🎶 **Playing** \`${videoInfo.videoDetails.title}\``, allowedMentions: { repliedUser: false } });
			} else {
				// add to queue
				// check exist in db or not
				let checkExist = await find_DB_Return("music_state", { gid: guild.id });
				if (!checkExist) insert_DB_One("music_state", { gid: guild.id, vc_id: vc.id, tc_id: message.channel.id, queue: [queueItem] });
				else edit_DB("music_state", { gid: guild.id }, { $set: { vc_id: vc.id, tc_id: message.channel.id }, $push: { queue: queueItem } });

				this.sendVideoInfo(message, "Added to queue", videoInfo);
				mReply.edit({ content: `🎶 **Added to queue** \`${videoInfo.videoDetails.title}\``, allowedMentions: { repliedUser: false } });
			}
		} catch (error) {
			mReply.edit({ content: `⛔ **An error occured!**\n\`${error}\``, allowedMentions: { repliedUser: false } });
		}
	}
};
