import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { Random } from "../../../local_lib/lib/random_api";

module.exports = class extends Command {
	constructor() {
		super("hug", {
			categories: "action",
			aliases: ["hugs"],
			info: "**Hugs**. Images are fetched from [Nekos.life API](https://nekos.life/)",
			usage: `${prefix}command [tag] [message]`,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let data: string = await new Random().getAnimeImgURLV2("hug");
		// check if valid link or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} hugs ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send(embed);
	}
};
