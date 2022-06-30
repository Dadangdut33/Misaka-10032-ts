import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("pause", {
			categories: "music",
			info: "Disconnect from voice channel and stop music",
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
			// pause player
			playerObj.player.pause();

			return message.reply({ content: `⏸ **Paused**`, allowedMentions: { repliedUser: false } });
		} else if (playerObj.player.state.status === "paused" || playerObj.player.state.status === "autopaused") {
			return message.reply({ content: `⛔ **Already paused!**`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `⛔ **Not playing anything!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
