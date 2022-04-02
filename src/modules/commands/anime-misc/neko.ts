import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { Random } from "../../../local_lib/lib/random_api";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("neko", {
			categories: "anime-misc",
			info: "Post random anime neko girl image using [Neko-love API](https://neko-love.xyz/)",
			usage: `\`${prefix}command\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		const msg = await message.channel.send(`Loading...`);
		const data = await new Random().getNeko();

		if (data.code !== 200) {
			return "Error 01: Unable to access the json content of API";
		}

		msg.delete();
		const chars: any = { "/": "%2F", ":": "%3A" };
		message.channel.send({
			embed: {
				color: "RANDOM",
				title: "Nya nya~",
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: number) => chars[m])})`,
				image: { url: data.url },
			},
		});
	}
};
