import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";

module.exports = class extends Command {
	constructor() {
		super("avatar", {
			aliases: ["profilepicture"],
			categories: "info-server",
			info: "Show avatar/profile picture of tagged user",
			usage: `\`${prefix}command/alias [tagged user]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let embed = new MessageEmbed();
		if (!message.mentions.users.first()) {
			//Embed
			embed.setTitle(`Your Profile Picture! (${message.author.tag})`);
			embed.setColor(`RANDOM`);
			embed.setImage(message.author.displayAvatarURL({ format: "jpg", size: 2048 }));
			embed.addField(
				`Avatar URL`,
				`[JPG](${message.author.displayAvatarURL({ format: "jpg", size: 2048 })}) | [PNG](${message.author.displayAvatarURL({ format: "png", size: 2048 })}) | [WEBP](${message.author.displayAvatarURL({
					format: "webp",
					size: 2048,
				})})`
			);
			embed.setFooter(`${message.author.username}'s Profile`);

			return message.channel.send(embed);
		} else {
			let User = message.mentions.users.first();

			//Embed
			embed.setTitle(`${User!.tag}'s Profile Picture!`);
			embed.setColor(`RANDOM`);
			embed.setImage(User!.displayAvatarURL({ format: "jpg", size: 2048 }));
			embed.addField(
				`Avatar URL`,
				`[JPG](${User!.displayAvatarURL({ format: "jpg", size: 2048 })}) | [PNG](${User!.displayAvatarURL({ format: "png", size: 2048 })}) | [WEBP](${User!.displayAvatarURL({
					format: "webp",
					size: 2048,
				})})`
			);
			embed.setFooter(`Requested by ${message.author.username}`);

			return message.channel.send(embed);
		}
	}
};
