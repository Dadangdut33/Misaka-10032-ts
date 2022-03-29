import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { reverseString } from "../../../local_lib/functions";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("reverse", {
			categories: "text",
			info: '*"esrever"* a sentence',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					description: "esrever ot tnaw uoy taht txet eht retne esaelP",
				},
			});

		return message.channel.send(reverseString(args.join(" ")));
	}
};
