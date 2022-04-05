import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { Random_Api } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("kitsune", {
			categories: "anime-misc",
			info: "Post random kitsune girl image using [Neko-love API](https://neko-love.xyz/)",
			usage: `\`${prefix}command\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		const msg = await message.channel.send(`Loading...`);
		let data = await new Random_Api().getKitsune();

		if (data.code !== 200) {
			return "Error 01: Unable to access the json content of API";
		}

		msg.delete();
		const chars: any = { "/": "%2F", ":": "%3A" };
		return message.channel.send({
			embed: {
				color: "RANDOM",
				title: `Gao~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: data.url },
			},
		});
	}
};
