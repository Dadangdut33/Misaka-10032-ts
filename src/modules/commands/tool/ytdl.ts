import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { validateURL, getInfo, chooseFormat, getVideoID } from "ytdl-core";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("ytdl", {
			categories: "tool",
			info: "Get a yt video download link",
			usage: `\`${prefix}command/alias <video link>\``,
			guildOnly: false,
		});
	}

	async highestVideo(url: string) {
		let info = await getInfo(url);
		let format = chooseFormat(info.formats, { quality: "highestvideo", filter: "audioandvideo" });
		console.log(format);
		return format;
	}

	async run(message: Message, args: string[]) {
		if (!args.length) return message.channel.send("Error! Please provide a valid youtube video URL.");
		if (!validateURL(args[0])) return message.channel.send("Error! Please provide a valid youtube video URL.");

		const msg = await message.channel.send(`Please wait... Video URL: \`${args[0]}\``);

		let url = args[0];
		let vFormat = await this.highestVideo(url);
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
			.setTitle(`Info Get`)
			.setDescription(`mimeType: \`${vFormat.mimeType}\``)
			.addField("Video ID/Original Link", `\`${getVideoID(url)}\`/${url}`, true)
			.addField("FPS", `${vFormat.fps}`, true)
			.addField("Bitrate", `${vFormat.bitrate}`, true)
			.addField("Audio Bitrate", `${vFormat.audioBitrate}`, true)
			.addField("Resolution", `${vFormat.width}x${vFormat.height}`, true)
			.addField("Video Format", `${vFormat.container}`, true)
			.addField(`Download link [${vFormat.quality}]`, `[Download](${vFormat.url})`, false)
			.setColor("#FF0000")
			.setTimestamp();

		msg.edit(`**Loading Finished**`);
		setTimeout(() => msg.delete(), 5000);
		return message.channel.send({ embeds: [embed] });
	}
};
