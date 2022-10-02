import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from "@discordjs/voice";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("move", {
			categories: "music",
			info: "Move to user's connected voice channel",
			usage: `\`${prefix}command\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		const user = message.member!;
		const guild = message.guild!;

		// check if user is in vc or not
		if (!user.voice.channel) return message.reply({ content: "⛔ **You must be in a voice channel to use this command!**", allowedMentions: { repliedUser: false } });

		const vc = user.voice.channel;

		// check if bot is in vc or not
		if (!guild.me?.voice.channel) return message.reply({ content: "⛔ **Bot is not connected to any voice channel!**", allowedMentions: { repliedUser: false } });

		// check if user is in the same vc as bot
		if (guild.me?.voice.channel.id === vc.id) return message.reply({ content: "⛔ **You are already in the same voice channel as me!**", allowedMentions: { repliedUser: false } });

		// join vc
		joinVoiceChannel({
			channelId: vc.id,
			guildId: guild.id,
			adapterCreator: guild.voiceAdapterCreator! as DiscordGatewayAdapterCreator,
		});

		return message.reply({ content: `✈ **Moved** to \`${vc.name}\``, allowedMentions: { repliedUser: false } });
	}
};
