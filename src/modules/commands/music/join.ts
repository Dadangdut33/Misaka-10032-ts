import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
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
	async run(message: Message, args: string[], { musicP, addNewPlayer }: { musicP: musicSettingsInterface; addNewPlayer: addNewPlayerArgsInterface }) {
		const user = message.member!;
		const guild = message.guild!;

		// check if user is in vc or not
		if (!user.voice.channel) {
			return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });
		}

		const vc = user.voice.channel;

		// check if bot is in vc or not
		if (guild.me?.voice.channel && getVoiceConnection(guild.id)) {
			return message.reply({ content: "⛔ **Bot is already in a voice channel!** Use `move` command if you want to change it's location", allowedMentions: { repliedUser: false } });
		}

		// join vc
		joinVoiceChannel({
			channelId: vc.id,
			guildId: guild.id,
			adapterCreator: guild.voiceAdapterCreator! as DiscordGatewayAdapterCreator,
		});

		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}

		return message.reply({ content: `✅ **Joined** \`${vc.name}\``, allowedMentions: { repliedUser: false } });
	}
};
