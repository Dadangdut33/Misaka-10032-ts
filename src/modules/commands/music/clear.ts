import { Guild, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface } from "../../../handler";
import { getVoiceConnection } from "@discordjs/voice";
import { edit_DB_One } from "../../../utils";
import { playerObject } from "../../../handler/Command";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("clear", {
			categories: "music",
			info: "Stop and clear current radio queue",
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
		if (!getVoiceConnection(guild.id)) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP);
			playerObj = musicP.get(guild.id)!;
		}

		// stop current music
		if (playerObj.player.state.status === "playing" || playerObj.player.state.status === "paused") {
			edit_DB_One("music_state", { gid: guild.id }, { queue: [] });

			return message.reply({ content: `⏹ **Queue Cleared.**`, allowedMentions: { repliedUser: false } });
		} else {
			return message.reply({ content: `⛔ **No radio is playing!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
