import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { RandomApi } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("punch", {
			categories: "action",
			aliases: ["punches"],
			info: "Punches others. Images are fetched from [Neko love API](https://neko-love.xyz/)",
			usage: `\`${prefix}command [tag] [message]\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		let data: string = await new RandomApi().getAnimeImgURL("punch");
		// check if there is http or not
		if (!data.includes("http")) return message.channel.send(data ? data : "Something went wrong");
		message.delete();

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} punches ${args.join(" ")}`)
			.setImage(data);

		return message.channel.send(embed);
	}
};
