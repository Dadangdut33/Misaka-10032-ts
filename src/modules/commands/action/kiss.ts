import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { RandomApi } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("kiss", {
			categories: "action",
			aliases: ["kisses"],
			info: "Kisses people, I dunno man but this one seems kinda geh. Images are fetched from [Neko love API](https://neko-love.xyz/)",
			usage: `\`${prefix}command [tag] [message]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let data: string = await new RandomApi().getAnimeImgURL("kiss");
		// check if valid link or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");
		message.delete();

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} kisses ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send({ embeds: [embed] });
	}
};
