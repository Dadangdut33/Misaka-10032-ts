import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("tempconvert", {
			aliases: ["tempc", "tc"],
			categories: "tool",
			info: "Convert temperature provided into Celcius (C), Fahrenheit (F), Reamur (R), and Kelvin (K)",
			usage: `\`${prefix}command/alias <c/f/r/k> <temperature in number>\``,
			guildOnly: false,
		});
		this.prefix = prefix;
	}

	async run(message: Message, args: string[]) {
		if (args.length < 2 || isNaN(parseInt(args[1])))
			return message.channel.send("Invalid format. For more info please check using the help command. Example should be like this\n`" + this.prefix + "tempconvert c 100`");

		const convertDict: any = {
			c: ["Celcius", celciusToFahrenheit, celciusToReamur, celciusToKelvin],
			celcius: ["Celcius", celciusToFahrenheit, celciusToReamur, celciusToKelvin],
			f: ["Fahrenheit", fahrenheitToCelcius, fahrenheitToReamur, fahrenheitToKelvin],
			fahrenheit: ["Fahrenheit", fahrenheitToCelcius, fahrenheitToReamur, fahrenheitToKelvin],
			r: ["Reamur", reamurToCelcius, reamurToFahrenheit, reamurToKelvin],
			reamur: ["Reamur", reamurToCelcius, reamurToFahrenheit, reamurToKelvin],
			k: ["Kelvin", kelvinToCelcius, kelvinToFahrenheit, kelvinToReamur],
			kelvin: ["Kelvin", kelvinToCelcius, kelvinToFahrenheit, kelvinToReamur],
		};

		// check if the unit is valid
		if (!convertDict[args[0].toLowerCase()]) return message.channel.send("Invalid temperature unit!");

		let embed = new MessageEmbed()
			.setColor("RANDOM")
			.setTitle(`${parseFloat(args[1])}° ${convertDict[args[0]][0]} Converted To`)
			.addField(
				`${convertDict[args[0]][1](parseFloat(args[1])).name}`,
				`${convertDict[args[0]][1](parseFloat(args[1])).value.toFixed(2)}° ${convertDict[args[0]][1](parseFloat(args[1])).name.charAt(0)}`,
				true
			)
			.addField(
				`${convertDict[args[0]][2](parseFloat(args[1])).name}`,
				`${convertDict[args[0]][2](parseFloat(args[1])).value.toFixed(2)}° ${convertDict[args[0]][2](parseFloat(args[1])).name.charAt(0)}`,
				true
			)
			.addField(
				`${convertDict[args[0]][3](parseFloat(args[1])).name}`,
				`${convertDict[args[0]][3](parseFloat(args[1])).value.toFixed(2)}° ${convertDict[args[0]][3](parseFloat(args[1])).name.charAt(0)}`,
				true
			)
			.setTimestamp();

		return message.channel.send({ embeds: [embed] });
	}
};

//Celcius
function celciusToFahrenheit(c: number) {
	return { name: "Fahrenheit", value: (c * 9) / 5 + 32 };
}

function celciusToReamur(c: number) {
	return { name: "Reamur", value: (c * 4) / 5 };
}

function celciusToKelvin(c: number) {
	return { name: "Kelvin", value: c + 273.16 };
}

//Fahrenheit
function fahrenheitToCelcius(f: number) {
	return { name: "Celcius", value: ((f - 32) * 5) / 9 };
}

function fahrenheitToReamur(f: number) {
	return { name: "Reamur", value: ((f - 32) * 4) / 9 };
}

function fahrenheitToKelvin(f: number) {
	return { name: "Kelvin", value: ((f - 32) * 5) / 9 + 273.16 };
}

//Reamur
function reamurToCelcius(r: number) {
	return { name: "Celcius", value: (r * 5) / 4 };
}

function reamurToFahrenheit(r: number) {
	return { name: "Fahrenheit", value: (r * 9) / 4 + 32 };
}

function reamurToKelvin(r: number) {
	return { name: "Kelvin", value: (r * 5) / 4 + 273.16 };
}

//Kelvin
function kelvinToCelcius(k: number) {
	return { name: "Celcius", value: k - 273.16 };
}

function kelvinToFahrenheit(k: number) {
	return { name: "Fahrenheit", value: ((k - 273.16) * 9) / 5 + 32 };
}

function kelvinToReamur(k: number) {
	return { name: "Reamur", value: ((k - 273.16) * 4) / 5 };
}
