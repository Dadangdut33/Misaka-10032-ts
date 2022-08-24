import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("stop", {
			categories: "music",
			info: "Stop and clear current radio queue",
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
		if (!getVoiceConnection(guild.id)) {
			return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });
		}

		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}

		// stop current music
		if (playerObj.player.state.status === "playing") {
			const wasLoop = playerObj.loop;
			const wasAuto = playerObj.auto;
			playerObj.relatedIdTakenThisSession = [];
			playerObj.auto = false;
			playerObj.loop = false;
			playerObj.player.stop();

			return message.reply({
				content: `⏹ **Stopped radio.**${wasLoop ? ` Loop mode disabled automatically.` : ``} ${wasAuto ? ` Auto mode disabled automatically.` : ``}`,
				allowedMentions: { repliedUser: false },
			});
		} else {
			return message.reply({ content: `⛔ **Radio is not playing anything!**`, allowedMentions: { repliedUser: false } });
		}
	}
};
