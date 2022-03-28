import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { Random } from "../../../local_lib/lib/random_api";

module.exports = class extends Command {
	constructor() {
		super("slap", {
			categories: "action",
			aliases: ["slaps"],
			info: "Slaps people. Images are fetched from [Nekos.live API](https://nekos.life/)",
			usage: `${prefix}command [tag] [message]`,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		let data: string = await new Random().getAnimeImgURLV2("slap");
		// check if there is http or not
		if (!data.includes("http")) {
			return message.channel.send(data ? data : "Something went wrong");
		}
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} slaps ${args.join(" ")}`)
			.setImage(data);

		message.channel.send(embed);
	}
};
