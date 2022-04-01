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
		message.channel.send(data);
	}
};
