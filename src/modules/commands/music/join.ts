import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, StaticState } from "../../../handler";
import { joinVoiceChannel, DiscordGatewayAdapterCreator, getVoiceConnection } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("join", {
			aliases: ["connect"],
			categories: "music",
			info: "Join user's connected voice channel",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[], { music, staticState }: { music: musicSettingsInterface; staticState: StaticState }) {
		const user = message.member!;
		const guild = message.guild!;
		const { player, currentAudio } = music;

		// check if user is in vc or not
		if (!user.voice.channel) {
			return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });
		}

		const vc = user.voice.channel;

		// check if bot is in vc or not
		if (message.guild?.me?.voice.channel) {
			return message.reply({ content: "⛔ **Bot is already in a voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// join vc
		let connection = joinVoiceChannel({
			channelId: vc.id,
			guildId: guild.id,
			adapterCreator: guild.voiceAdapterCreator! as DiscordGatewayAdapterCreator,
		});

		if (player.state.status === "paused" || player.state.status === "playing" || player.state.status === "autopaused") {
			connection.subscribe(player);

			try {
				player.play(currentAudio);
			} catch (error) {
				player.play(staticState.getFreshAudioResource());
			}

			staticState.setLocalStatus("playing");
			player.unpause();
			return message.reply({ content: `✅ **Joined** \`${vc.name}\` **Continuing current radio**`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `✅ **Joined** \`${vc.name}\``, allowedMentions: { repliedUser: false } });
		}
	}
};
