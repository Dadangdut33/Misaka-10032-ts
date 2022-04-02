import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { Random } from "../../../local_lib/lib/random_api";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("wallpaper", {
			categories: "anime-misc",
			info: "Post random anime wallpaper fetched from [Nekos.life API](https://nekos.life/)",
			usage: `\`${prefix}command\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		let data = await new Random().getWallpaper();
		// check if valid link or not
		if (!data.image.includes("http")) return message.channel.send(data ? data : "Something went wrong");

		const replaceChars: any = { "/": "%2F", ":": "%3A" };
		message.channel.send({
			embed: {
				color: "RANDOM",
				title: `Via Nekos.fun`,
				url: `https://nekos.fun/`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.image.replace(/[:/]/g, (m: string) => replaceChars[m])})`,
				image: { url: data.image },
			},
		});
	}
};
