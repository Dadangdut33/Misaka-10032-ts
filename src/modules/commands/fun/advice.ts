import { Message } from "discord.js";
import { RandomApi } from "../../../utils";
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
		let data = await new RandomApi().getAdvice();

		if (!data) {
			msg.edit(`Can't reached API, try again later!`);
			return;
		}

		msg.delete();
		return message.channel.send({
			embeds: [
				{
					description: data,
					color: "RANDOM",
				},
			],
		});
	}
};
