import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { Random_Api } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("smug", {
			categories: "action",
			aliases: ["smugs"],
			info: "**Smug**. Images are fetched from [Neko fun API](https://www.nekos.fun/apidoc.html)",
			usage: `\`${prefix}command [tag] [message]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let data: string = await new Random_Api().getAnimeImgURLV2("smug");
		// check if valid link or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");
		message.delete();

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} smugs ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send(embed);
	}
};
