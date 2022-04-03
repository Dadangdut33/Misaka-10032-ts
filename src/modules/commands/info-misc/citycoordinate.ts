import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import ct from "countries-and-timezones";
const cities = require("all-the-cities");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("citycoordinate", {
			aliases: ["cc"],
			categories: "info-misc",
			info: "Get city coordinate using the [all-the-cities](https://www.npmjs.com/package/all-the-cities)",
			usage: `\`${prefix}command/alias <city name>\``,
			guildOnly: false,
		});
	}

	capitalizeTheFirstLetterOfEachWord(words: string) {
		let separateWord = words.toLowerCase().split(" ");
		for (let i = 0; i < separateWord.length; i++) {
			separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
		}
		return separateWord.join(" ");
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send("Please enter a valid city name!");
		let search = args.join(" ").trim();

		let result = cities.filter((city: any) => city.name.match(this.capitalizeTheFirstLetterOfEachWord(search)));
		if (result[0] === undefined)
			return message.channel.send({
				embed: {
					color: 0x00ff00,
					description: "Can't find the city, maybe you type it wrong?",
				},
			});

		let location = result[0].loc.coordinates, //Location
			timezones = ct.getTimezonesForCountry(result[0].country); //Timezone

		let embed = new MessageEmbed()
			.setAuthor(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ format: "jpg", size: 2048 }))
			.setTitle(`${result[0].name} [${result[0].country}]\n**Population:** ${result[0].population}\n**Coordinates**: \`${location[1]}, ${location[0]}\``)
			.addField(`City ID`, result[0].cityId, true)
			.addField(`Feature Code`, result[0].featureCode, true)
			.addField(`Admin Code`, result[0].adminCode, true)
			.setTimestamp();

		// timezone, slice to 20 per field
		const loopAmount = Math.ceil(timezones.length / 20); // get loop amount

		for (let i = 0; i < loopAmount; i++) {
			let sliced = timezones.slice(i * 20, i * 20 + 20);
			const toAdd = [];
			for (let j = 0; j < sliced.length; j++) {
				toAdd.push(`${sliced[j].name} [${sliced[j].utcOffsetStr}]`);
			}
			embed.addField(i === 0 ? `Timezones in country` : `Cont.`, toAdd.join("\n"), true);
		}

		message.channel.send(embed);
	}
};
