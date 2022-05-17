import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { RandomApi } from "../../../utils";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("ship", {
			categories: "fun",
			info: "Ship people or characters using [Duncte123 API](https://docs.duncte123.com/)",
			usage: `\`${prefix}command <charname> x <charname> *Notice the (x)\``,
			guildOnly: false,
		});
		this.prefix = prefix;
	}

	async run(message: Message, args: string[]) {
		if (!args.includes("x"))
			return message.channel.send({
				embeds: [
					{
						title: "Invalid format",
						description: `Please enter the name that you want to ship. Usage should be like this example :arrow_down:\`\`\`ts\n${this.prefix}ship Togashi Yuta x Takanashi Rikka\`\`\``,
					},
				],
			});

		const msg = await message.channel.send(`:cruise_ship: Shipping...`);

		let success = true;
		// find index x
		const index = args.indexOf("x"),
			chara1 = args.slice(0, index).join(" "),
			chara2 = args.slice(index + 1).join(" ");

		const { data } = await new RandomApi().getShip(chara1, chara2).catch((e) => {
			console.log(e);
			msg.edit(`Can't reached API, try again later!`);
			success = false;
		});

		if (!success || !data) return;

		msg.delete();
		return message.channel.send({
			embeds: [
				{
					color: "RANDOM",
					title: `${chara1} x ${chara2}`,
					description: `The calculated score of ${data.names} is \`${data.score_int}%\``,
				},
			],
		});
	}
};
