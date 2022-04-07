import { Message } from "discord.js";
import { RandomApi } from "../../../utils";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
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
		const { data } = await new RandomApi().getJoke().catch((e) => {
			msg.edit(`Can't reached API, try again later!\nDetails: \`\`\`ts\n${e}\`\`\``);
			success = false;
		});

		if (!success || !data) return;

		msg.delete();
		return message.channel.send({
			embeds: [
				{
					color: "RANDOM",
					title: data.title,
					url: data.url,
					description: data.body,
				},
			],
		});
	}
};
