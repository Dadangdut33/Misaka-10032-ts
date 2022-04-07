import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { RandomApi } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("poke", {
			categories: "action",
			aliases: ["pokes"],
			info: "Pokes others. Images are fetched from [Neko fun API](https://www.nekos.fun/apidoc.html)",
			usage: `\`${prefix}command [tag] [message]\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		let data: string = await new RandomApi().getAnimeImgURLV2("poke");
		// check if there is http or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");
		message.delete();

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} pokes ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send({ embeds: [embed] });
	}
};
