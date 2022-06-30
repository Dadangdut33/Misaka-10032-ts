import { Message, Guild } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface } from "../../../handler";
import ytdl from "ytdl-core";
import { playerObject } from "../../../handler/Command";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("nowplaying", {
			aliases: ["np"],
			categories: "music",
			info: "Get now playing music",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[], { musicP, addNewPlayer }: { musicP: musicSettingsInterface; addNewPlayer: (guild: Guild, playerMaps: Map<string, playerObject>) => void }) {
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
			addNewPlayer(guild, musicP);
			playerObj = musicP.get(guild.id)!;
		}
		// check playing status
		if (playerObj.player.state.status === "playing") {
			const videoInfo = await ytdl.getInfo(playerObj.currentUrl);

			// pause player
			return message.reply({
				embeds: [
					{
						author: { name: `Now Playing` },
						description: `🎶 [${playerObj.currentTitle}](${playerObj.currentUrl}) (${videoInfo.videoDetails.lengthSeconds} seconds)`,
						image: {
							url: `https://img.youtube.com/vi/${videoInfo.videoDetails.videoId}/hqdefault.jpg`,
						},
					},
				],
				allowedMentions: { repliedUser: false },
			});
		} else {
			return message.reply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
