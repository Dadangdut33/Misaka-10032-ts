import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { Random } from "../../../local_lib/api_call/random";

module.exports = class extends Command {
	constructor() {
		super("punch", {
			categories: "action",
			aliases: ["punches"],
			info: "Punches others. Images are fetched from [Neko love API](https://nekos.life/)",
			usage: `${prefix}command [tag] [message]`,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		let data: string = await new Random().getAnimeImgURL("punch");
		// check if there is http or not
		if (!data.includes("http")) {
			return message.channel.send(data ? data : "Something went wrong");
		}
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} punches ${args.join(" ")}`)
			.setImage(data);

		message.channel.send(embed);
	}
};
