import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const commaNumber = require("comma-number");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("math", {
			aliases: ["eval"],
			categories: "tool",
			info: `Perform a basic math equation (+/-/x/:) based on the string provided\n\n**Notes**\n1. You can use both symbols for multiplication (* or x) and division (: or /)\n2. It\'s also ok not to use space\n\n**Example: **\`${prefix}math 3 * 3/2\``,
			usage: `\`${prefix}command/alias <...>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (args.length < 0) return message.channel.send("Please enter a valid argument!");

		const chars: any = { x: "*", ":": "/", ",": "." }; // Map the syntax
		const display: any = { "*": "x", ":": "/", ".": ",", _: "" }; // For display purposes

		try {
			var mathRes = eval(args.join(" ").replace(/[x:,]/g, (m) => chars[m]));

			var problem = [];
			for (var i = 0; i < args.length; i++) {
				problem[i] = commaNumber(
					args[i].replace(/[*:._]/g, (m) => display[m]),
					".",
					","
				);
			}

			let embed = new MessageEmbed()
				.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
				.addField(`Problem`, `${problem.join(" ")}`, false)
				.addField(`Solution`, `${commaNumber(mathRes, ".", ",")}`, false);

			return message.channel.send({ embeds: [embed] });
		} catch (e) {
			let embed = new MessageEmbed().setTitle(`Error`).setDescription(`Invalid arguments provided, for more info please check using the help commands!\n**Error:**\`\`\`${e}\`\`\``);

			return message.channel.send({ embeds: [embed] });
		}
	}
};
