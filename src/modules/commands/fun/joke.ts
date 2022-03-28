import { Message } from "discord.js";
import { Random } from "../../../local_lib/lib/random_api";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";

module.exports = class extends Command {
	constructor() {
		super("joke", {
			categories: "fun",
			aliases: ["jokes"],
			info: "Gives you random joke using [duncte123 API](https://docs.duncte123.com/)",
			usage: `\`${prefix}joke\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		const msg = await message.channel.send(`Loading...`);

		let success = true;
		let { data } = await new Random().getJoke().catch((e) => {
			msg.edit(`Can't reached API, try again later!\nDetails: \`\`\`ts\n${e}\`\`\``);
			success = false;
		});
		console.log(data);

		if (!success || !data) return;

		msg.delete();
		return message.channel.send({
			embed: {
				color: "RANDOM",
				title: data.title,
				url: data.url,
				description: data.body,
			},
		});
	}
};