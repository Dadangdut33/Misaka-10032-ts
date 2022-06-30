import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("loop", {
			categories: "music",
			info: "Enable/disable loop mode to loop current song",
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

		if (!playerObj.loop) {
			playerObj.loop = true;
			return message.reply({ content: `🔃 **Loop mode enabled**`, allowedMentions: { repliedUser: false } });
		} else {
			playerObj.loop = false;
			return message.reply({ content: `👌 **Loop mode disabled**`, allowedMentions: { repliedUser: false } });
		}
	}
};
