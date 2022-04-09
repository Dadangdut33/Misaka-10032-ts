import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { RandomApi } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("tickle", {
			categories: "action",
			aliases: ["tickles"],
			info: "Tickles people lol. Images are fetched [Neko fun API](https://www.nekos.fun/apidoc.html)",
			usage: `\`${prefix}command [tag] [message]\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		let data: string = await new RandomApi().getAnimeImgURLV2("tickle");
		// check if there is http or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} tickles ${args.join(" ")}`)
			.setImage(data);

		return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
	}
};
