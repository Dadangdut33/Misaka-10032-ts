import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const banish = require("to-zalgo/banish");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("banish", {
			categories: "text",
			info: "Normalize **ẑ̴̧̳̯̔̒ā̶̟͖̗̤̙̿̉̎͛͋̆͂͝͝l̶̡̠̞̫̣̪̮̯̤̙͂̀͝͝ͅģ̵̡̨͚͚̤̦̪͕͓̞̖͖̄̏̏́̊̃̆͜o̴̡̧͎̻͈͓̞̮̩̎͆̓̉͒̽̎̿̐̋̊͆̈͠ͅě̷͔̠d̶̡̨̮̮̮̳̙͚̙͕͙̥̔̇̊̍̇** letter(s) using [to-zalgo](https://www.npmjs.com/package/to-zalgo)",
			usage: `\`${prefix}command/alias <text>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send({ embed: { description: "Please enter the ẑ̴̧̳̯̔̒ā̶̟͖̗̤̙̿̉̎͛͋̆͂͝͝l̶̡̠̞̫̣̪̮̯̤̙͂̀͝͝ͅģ̵̡̨͚͚̤̦̪͕͓̞̖͖̄̏̏́̊̃̆͜o̴̡̧͎̻͈͓̞̮̩̎͆̓̉͒̽̎̿̐̋̊͆̈͠ͅě̷͔̠d̶̡̨̮̮̮̳̙͚̙͕͙̥̔̇̊̍̇ text that you want to normalize" } });

		return message.channel.send(banish(args.join(" ")));
	}
};
