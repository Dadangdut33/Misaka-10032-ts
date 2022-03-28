import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { Random } from "../../../local_lib/api_call/random";

module.exports = class extends Command {
	constructor() {
		super("cuddle", {
			categories: "action",
			aliases: ["cuddles"],
			info: "**Cuddles**. Images are fetched from [Nekos.life API](https://nekos.life/)",
			usage: `${prefix}command [tag] [message]`,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let data: string = await new Random().getAnimeImgURLV2("cuddle");
		// check if valid link or not
		if (!data.includes("http")) {
			return message.channel.send(data ? data : "Something went wrong");
		}
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} cuddles ${args.join(" ")}`)
			.setImage(data);

		message.channel.send(embed);
	}
};
