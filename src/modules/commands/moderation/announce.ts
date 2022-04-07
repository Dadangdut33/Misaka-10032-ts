import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

function validURL(str: string) {
	//Check if it's a valid url or not
	let pattern = new RegExp(
		"^(https?:\\/\\/)?" + // protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // fragment locator
	return !!pattern.test(str);
}

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("announce", {
			categories: "moderation",
			info: "Announce stuff but with more feature using embed. Only usable by admin and mods. Leave the not desired optional empty but don't erase the quote",
			usage: `\`${prefix}announce "title with quotes" "description with quotes" "image URL with quotes" "field title with quotes" "field content with quotes"\`\n**Notes:**\n**•** Image URL is optional leave it as empty quotes if not used\n**•** Field title is optional but field value is a must -> IF you insert field title\n**•** You can subtitute quotes by using single quotes inside the announcement`,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[]) {
		message.delete();
		if (args.length < 1) return message.reply("Nothing to say?").then((msg) => setTimeout(() => msg.delete(), 5000));

		let regex = /(["])(?:(?=(\\?))\2.)*?\1/g,
			msg = args.join(" ").match(regex);

		if (!msg)
			return message.channel.send(`**Invalid Arguments Provided!** Please check the help commands if unsure ${message.author}`).then((msg) => setTimeout(() => msg.delete(), 5000));

		for (let i = 0; i < msg.length; i++) {
			msg[i] = msg[i].replace(/"/g, "");
		}

		// Creating and sending embed...
		let embed = new MessageEmbed()
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
			.setTitle(msg[0])
			.setColor("#000")
			.setDescription(msg[1]);

		//Check Image
		if (validURL(msg[2])) {
			if (/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg|tiff|bmp|[\?size=0-9])$/gi.test(msg[2])) {
				//Check if it's an image or not
				embed.setImage(msg[2]);
			}
		}

		// Check field title & content
		if (msg[3] && msg[4]) {
			embed.addField(msg[3], msg[4]);
		}

		//Send embed
		message.channel.send({ embeds: [embed] }).catch(async (err) => {
			return message.channel.send("Invalid form").then((msg) => setTimeout(() => msg.delete(), 5000));
		});
	}
};
