import { Message } from "discord.js";
import { Random } from "../../../utils/lib/random_api";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
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
