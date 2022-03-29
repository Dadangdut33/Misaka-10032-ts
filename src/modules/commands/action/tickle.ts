import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { Random } from "../../../local_lib/lib/random_api";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("tickle", {
			categories: "action",
			aliases: ["tickles"],
			info: "Tickles people lol. Images are fetched [Nekos.life API](https://nekos.life/)",
			usage: `${prefix}command [tag] [message]`,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		let data: string = await new Random().getAnimeImgURLV2("tickle");
		// check if there is http or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} tickles ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send(embed);
	}
};
