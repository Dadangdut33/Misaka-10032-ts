import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("leave", {
			aliases: ["disconnect"],
			categories: "music",
			info: "Disconnect from voice channel",
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
		if (!guild.me?.voice.channel) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// leave vc
		if (getVoiceConnection(guild.id)) getVoiceConnection(guild.id)!.destroy();
		else guild.me?.voice.disconnect();

		// stop player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}
		playerObj.relatedIdTakenThisSession = [];
		playerObj.player.stop();

		return message.reply({ content: `👌 **Left** \`${vc.name}\``, allowedMentions: { repliedUser: false } });
	}
};
