import { Message, VoiceBasedChannel, Guild } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { getVoiceConnection, joinVoiceChannel, DiscordGatewayAdapterCreator, createAudioPlayer, createAudioResource, AudioPlayer } from "@discordjs/voice";
import ytdl from "ytdl-core";

module.exports = class extends Command {
	player: AudioPlayer;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("radio", {
			categories: "music",
			info: "Play a song/radio (Youtube link Only). Available predefined radio:\n- [**[lofi]**](https://youtu.be/5qap5aO4i9A) - lofi hip hop radio - beats to relax/study to\n- [**[animelofi]**](https://youtu.be/WDXPJWIgX-o) - anime lofi hip hop radio - 24/7 chill lofi remixes of anime\n- [**[piano]**](https://youtu.be/xWRHTpqQMGM) - Beautiful Piano Music 24/7 - Study Music, Relaxing Music, Sleep Music, Meditation Music\n- [**[phonk]**](https://youtu.be/Ax4Y5n4f5K8) - 24/7 TRAPPIN IN JAPAN // phonk / lofi hip hop / vapor trap Radio.\n\n**Note:** The bot will repeat the song when it's done, If you want to stop the radio, use the stop command.",
			usage: `\`${prefix}command [valid YT Link/lofi/animelofi/piano/phonk]\``,
			guildOnly: true,
		});
		this.player = createAudioPlayer();
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

	getVideoResource(link: string) {
		return createAudioResource(ytdl(link), { inlineVolume: true });
	}

	sendVideoInfo(message: Message, videoInfo: ytdl.videoInfo) {
		message.channel.send({
			embeds: [
				{
					title: "Now Playing",
					description: `**[${videoInfo.videoDetails.title}](${videoInfo.videoDetails.video_url})** by [${videoInfo.videoDetails.author.name}](${videoInfo.videoDetails.ownerProfileUrl})`,
					fields: [
						{
							name: "Live / Duration",
							value: `${videoInfo.videoDetails.isLiveContent ? "Yes" : "No"} / ${videoInfo.videoDetails.lengthSeconds} seconds`,
							inline: true,
						},
						{
							name: "Views / Likes",
							value: `${videoInfo.videoDetails.viewCount} / ${videoInfo.videoDetails.likes}`,
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

	async run(message: Message, args: string[]) {
		// check if args is empty
		if (!args[0]) return message.reply({ content: "⛔ **You must provide a valid Youtube link! or choose a valid predefined radio!**", allowedMentions: { repliedUser: false } });

		const radioDict: any = {
			lofi: "https://youtu.be/5qap5aO4i9A",
			animelofi: "https://youtu.be/WDXPJWIgX-o",
			piano: "https://youtu.be/xWRHTpqQMGM",
			phonk: "https://youtu.be/Ax4Y5n4f5K8",
		};

		let link: string;
		// check if args is a predefined radio
		if (radioDict[args[0]]) link = radioDict[args[0]];
		else {
			// verify yt link first
			if (!ytdl.validateURL(args[0])) return message.reply({ content: "⛔ **You must provide a valid Youtube link!**", allowedMentions: { repliedUser: false } });

			link = args[0];
		}

		// get data
		const user = message.member!;
		const guild = message.guild!;

		// check if user is in vc or not
		if (!user.voice.channel) return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });
		const vc = user.voice.channel;

		// vc connection
		let voiceConnection = getVoiceConnection(guild.id);

		// if bot not in vc join vc
		if (!getVoiceConnection(guild.id)) voiceConnection = this.joinVcChannel(message, vc, guild); // join vc

		const mReply = await message.reply({ content: `🎶 **Playing** \`${link}\``, allowedMentions: { repliedUser: false } });
		try {
			const videoInfo = await ytdl.getInfo(link);
			mReply.edit({ content: `🎶 **Loading** \`${videoInfo.videoDetails.title}\`` });
			this.sendVideoInfo(message, videoInfo);

			// connect
			const resource = this.getVideoResource(link);
			voiceConnection!.subscribe(this.player);
			this.player.play(resource);

			mReply.edit({ content: `🎶 **Playing** \`${videoInfo.videoDetails.title}\`` });

			this.player.on("stateChange", () => {
				console.log(this.player.state.status);
				// if stopped, repeat
				if (this.player.state.status === "idle") {
					this.sendVideoInfo(message, videoInfo);
					this.player.play(this.getVideoResource(link));
				}

				if (this.player.state.status === "autopaused") {
					this.player.stop();

					// tels user that song is done
					message.channel.send({ content: `⏹ **Stopped.** Music done playing` });
				}
			});
		} catch (error) {
			mReply.edit({ content: `⛔ **An error occured!**\n${error}`, allowedMentions: { repliedUser: false } });
		}
	}
};
