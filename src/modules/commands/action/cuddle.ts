import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { Random } from "../../../local_lib/lib/random_api";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("cuddle", {
			categories: "action",
			aliases: ["cuddles"],
			info: "**Cuddles**. Images are fetched from [Neko fun API](https://www.nekos.fun/apidoc.html)",
			usage: `\`${prefix}command [tag] [message]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let data: string = await new Random().getAnimeImgURLV2("cuddle");
		// check if valid link or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");
		message.delete();

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} cuddles ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send(embed);
	}
};
