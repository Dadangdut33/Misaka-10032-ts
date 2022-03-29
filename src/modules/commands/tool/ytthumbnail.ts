import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("ytthumbnail", {
			aliases: ["thumbnail", "thumb"],
			categories: "tool",
			info: "Get thumbnails links in letying quality of a yt link",
			usage: `\`${prefix}command/alias <video link>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send("Error! Please provide a valid youtube video URL.");

		let normalID = args.join(" ").match(/v=([a-zA-Z0-9\_\-]+)&?/gi),
			embedID = args.join(" ").match(/embed\/([a-zA-Z0-9\_\-]+)&?/gi),
			shareID = args.join(" ").match(/.be\/([a-zA-Z0-9\_\-]+)&?/gi);

		let theID = "";
		if (normalID !== null) theID = normalID[0].replace(/v=/, "");
		if (embedID !== null) theID = embedID[0].replace(/embed\//, "");
		if (shareID !== null) theID = shareID[0].replace(/\.be\//, "");

		if (!theID) return message.channel.send("Error! Please provide a valid youtube video URL.");

		const msg = await message.channel.send(`Please wait... Video ID: \`${theID.replace(/&/, "")}\``);
		let defaultImg = `https://img.youtube.com/vi/${theID.replace(/&/, "")}/default.jpg`, // Default thumbnail
			hqDefault = `https://img.youtube.com/vi/${theID.replace(/&/, "")}/hqdefault.jpg`, // High Quality
			mqDefault = `https://img.youtube.com/vi/${theID.replace(/&/, "")}/mqdefault.jpg`, // Medium Quality
			sdDefault = `https://img.youtube.com/vi/${theID.replace(/&/, "")}/sddefault.jpg`, // Standard Definition
			maxDefault = `https://img.youtube.com/vi/${theID.replace(/&/, "")}/maxresdefault.jpg`;

		msg.edit(`**Loading Finished**`);
		msg.delete({
			timeout: 5000,
		});

		const embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ format: "png", size: 2048 }))
			.setTitle(`Link Info`)
			.setDescription(`**Video ID:** \`${theID.replace(/&/, "")}\`\n**Original Link:**\n${args.join(" ")}`)
			.addField(
				`Link to The Thumbnail`,
				`[Default Quality](${defaultImg}) | [HQ](${hqDefault}) | [MQ](${mqDefault}) | [SD](${sdDefault}) | [Maxres](${maxDefault})\n\n:arrow_down: **Preview of SD Quality**`,
				false
			)
			.setImage(sdDefault)
			.setColor("FF0000")
			.setTimestamp();

		return message.channel.send(embed);
	}
};
