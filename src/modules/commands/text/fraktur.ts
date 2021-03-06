import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const fraktur = require("fraktur");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("fraktur", {
			categories: "text",
			info: '*"π£π―ππ¨π±π²π―"* letter(s) using [fraktur](https://www.npmjs.com/package/fraktur/v/1.1.0)',
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embeds: [
					{
						description: "ππ©π’ππ°π’ π’π«π±π’π― π±π₯π’ π±π’π΅π± π±π₯ππ± πΆπ¬π² π΄ππ«π± π±π¬ π£π―ππ¨π±π²π―π¦π£π¦π’π°",
					},
				],
			});

		message.channel.send(fraktur.encode(args.join(" ")));
	}
};
