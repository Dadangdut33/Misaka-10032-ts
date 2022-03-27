import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { Random } from "../../../local_lib/api_call/random";
const random = new Random();

module.exports = class extends Command {
	constructor() {
		super("pat", {
			categories: "action",
			aliases: ["pats"],
			info: "Pats people. Images are fetched from [Nekos.live API](https://nekos.life/)",
			usage: `${prefix}command [tag] [message]`,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let data: string = await random.getAnimeImgURLV2("pat");
		// check if there is http or not
		if (!data.includes("http")) {
			return message.channel.send(data ? data : "Something went wrong");
		}
		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setDescription(`${message.author.username} pats ${args.join(" ")}`)
			.setImage(data);

		message.channel.send(embed);
	}
};
