import { Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";

const responses = [
	"If my intuition is correct, you should choose",
	"You should choose",
	"I would say",
	"You should choose",
	"Based on the RNG that i got, you should choose",
	"The RNG say that you should choose",
	"It's that, go for",
	"The answer would be --->",
	"Go for",
];

module.exports = class extends Command {
	constructor() {
		super("choose", {
			categories: "fun",
			info: "Help the bot choose for you.",
			usage: `**[-]**\`${prefix}choose [[option 1]] [[option 2]] ... [[option x]]\`\n**[-]**\`${prefix}choose [arguments] [[option 1]] [[option 2]] ... [[option x]]\`\n***Notice the []**`,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		let regex = /\[(.*?)\]/g;
		let options = args.join(" ").match(regex);

		if (!options)
			return message.channel.send({
				embed: {
					color: "RANDOM",
					description: `Please enter the correct argument example should be like this :arrow_down:\`\`\`css\n${prefix}choose [eat] [sleep] [study]\`\`\`For more info use the help commands.`,
				},
			});

		let withArgs = args.join(" ").replace(options.join(" "), "");

		// console.log(options.length);
		let x = Math.floor(Math.random() * options.length);
		let y = Math.floor(Math.random() * responses.length);

		if (!withArgs[0]) return message.channel.send(`${responses[y]} ${options[x].replace(/[\[\]]/g, '"')} **${message.author.username}**`);
		else return message.channel.send(`${withArgs}${options[x].replace(/[\[\]]/g, "")}`);
	}
};
