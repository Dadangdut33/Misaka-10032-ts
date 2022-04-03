import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../local_lib/functions";
const Chance = require("chance");
const chance = new Chance();

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("simulatepull", {
			categories: "genshin",
			aliases: ["simpull"],
			info: "Simulate gaccha pull of promotional character in genshin impact, Limit of 200\n\nData used for the rate are based from [genshin wiki](https://genshin-impact.fandom.com/wiki/Wishes)\n\n**Notes**: Data is not saved, so pity works only on the pull done",
			usage: `\`${prefix}command/alias <single/ten> <amount of pull>\`\n**Notes:** The single/ten is the pull type`,
			guildOnly: true,
		});
		this.prefix = prefix;
	}

	async run(message: Message, args: string[]) {
		if (!args[0] || !["single", "ten"].includes(args[0].toLowerCase())) return message.channel.send("Input invalid.");

		if (isNaN(parseInt(args[1])))
			return message.channel.send(`Invalid input, check for correct usage using help commands. example of a correct way to use it:$ \`${this.prefix}${this.name} single 4\``);

		let fiveStar,
			fourStar,
			get = [],
			chances,
			pity_4star_confirmed = false,
			pity_5star_confirmed = false,
			pity4 = 0,
			pity5 = 0,
			pity4Inside = 1,
			pity5Inside = 1,
			pages = [];

		const stepNumber = args[0] === "single" ? parseInt(args[1]) : parseInt(args[1]) * 10;

		for (let i = 1; i <= stepNumber; i++) {
			chances = chance.integer({ min: 0, max: 100 });

			// pity b5 for the 90th pull y is for the pity
			if (pity5 == 89) pity_5star_confirmed = true;

			// pity b4 for every 10 pull x is for the pity
			if (pity4 == 9) pity_4star_confirmed = true;

			if (chances <= 0.6 || pity_5star_confirmed === true) {
				//0.6%
				fiveStar = chance.bool();
				if (fiveStar) {
					get.push(`${i} -> ☆☆☆☆☆ (5 Stars) Character from banner`);
				} else {
					if (pity5Inside % 2 == 0) {
						get.push(`${i} -> ☆☆☆☆☆ (5 Stars) Character from banner`);
						pity5Inside = 1;
					} else {
						get.push(`${i} -> ☆☆☆☆☆ (5 Stars) Character but not from banner`);
						pity5Inside++;
					}
				}

				pity_5star_confirmed = false; //After get pity, make it 0 again
				pity5 = 0; // If b5 get, then pity reset
			} else if (chances <= 5.1 || pity_4star_confirmed === true) {
				//5.1%
				fourStar = chance.bool();

				if (fourStar) {
					get.push(`${i} -> ☆☆☆☆ (4 Stars) Character from Banner`);
				} else {
					if (pity4Inside % 2 === 0) {
						get.push(`${i} -> ☆☆☆☆ (4 Stars) Character from Banner`);
						pity4Inside = 1;
					} else {
						get.push(`${i} -> ☆☆☆☆ (4 Stars) Weapon`);
						pity4Inside++;
					}
				}

				pity_4star_confirmed = false; //After get pity, make it 0 again
				pity4 = 0; // If b4 get, then pity reset
			} else {
				//94.3%
				get.push(`${i} -> ☆☆☆ (3 Stars) Weapon`);
			}

			pity5++; //Count pity
			pity4++; //Count pity
		}

		// loop results with max of 60 slices of get array
		const amountOfLoop = Math.ceil(get.length / 60);

		for (let i = 0; i < amountOfLoop; i++) {
			const embed = new MessageEmbed()
				.setAuthor(message.author.username, message.author.displayAvatarURL({ format: "jpg", size: 2048 }))
				.setColor("#0099ff")
				.setTitle(`Simulated ${args[0].charAt(0).toUpperCase() + args[0].slice(1)} Times pull in Promotional Character Banner`)
				.setDescription(`${get.slice(i * 60, (i + 1) * 60).join("\n")}`);

			pages.push(embed);
		}

		paginationEmbed(message, pages);
	}
};
