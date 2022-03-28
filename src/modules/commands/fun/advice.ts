import { Random } from "../../../local_lib/api_call/random";
import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";

module.exports = class extends Command {
	constructor() {
		super("advice", {
			categories: "fun",
			aliases: ["adv"],
			info: "Gives you random advice using [Adviceslip API](https://api.adviceslip.com/)",
			usage: `\`${prefix}advice or ${prefix}adv\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		const msg = await message.channel.send(`Loading...`);
		let data = await new Random().getAdvice();

		if (!data) {
			msg.edit(`Can't reached API, try again later!`);
			return;
		}

		msg.delete();
		return message.channel.send({
			embed: {
				description: data,
				color: "RANDOM",
			},
		});
	}
};
