import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import moment from "moment-timezone";

module.exports = class extends Command {
	prefix;
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("timeconvert", {
			aliases: ["tz"],
			categories: "tool",
			info: "Convert timezone GMT (+/-)",
			usage: `\`${prefix}command/alias <+/-> <from tz> <+/-> <to tz>\``,
			guildOnly: false,
		});
		this.prefix = prefix;
	}

	async run(message: Message, args: string[]) {
		if (parseInt(args[1]) > 13 || parseInt(args[1]) < -12 || parseInt(args[1]) > 13 || parseInt(args[1]) < -12) {
			let embed = new MessageEmbed().setTitle(`Invalid timezone provided`).setDescription(`The valid timezone are range from -12 to +13, that is the law of physics`).setTimestamp();

			return message.channel.send({ embeds: [embed] });
		}

		if ((args[0] !== "+" && args[0] !== "-") || (args[2] !== "+" && args[2] !== "-")) {
			let embed = new MessageEmbed()
				.setTitle(`Please enter the correct arguments`)
				.setDescription(`For more info you can check on the help commands. Arguments used should be like this ex :arrow_down:\`\`\`css\n${this.prefix}tz + 7 - 7\`\`\``)
				.setTimestamp();

			return message.channel.send({ embeds: [embed] });
		}

		if (isNaN(parseInt(args[1])) || isNaN(parseInt(args[3]))) {
			let embed = new MessageEmbed().setDescription(`Invalid number Provided!`);

			return message.channel.send({ embeds: [embed] });
		}

		let dateFrom = moment.tz(`Etc/GMT${args[0] === "+" ? `-${args[1]}` : `+${args[1]}`}`).format("dddd DD MMMM YYYY HH:mm:ss"),
			dateTo = moment.tz(`Etc/GMT${args[2] === "+" ? `-${args[3]}` : `+${args[3]}`}`).format("dddd DD MMMM YYYY HH:mm:ss"),
			diff = parseInt(`${args[0]}${args[1]}`) - parseInt(`${args[2]}${args[3]}`),
			embed = new MessageEmbed()
				.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "png", size: 2048 }) })
				.setTitle(`Conversion of GMT${args[0]}${args[1]} to GMT${args[2]}${args[3]}`)
				.setDescription(`The difference between the two is \`${diff} Hours\``)
				.addField(`GMT${args[0]}${args[1]}`, dateFrom)
				.addField(`GMT${args[2]}${args[3]}`, dateTo)
				.setFooter({ text: `Current Local Time ->` })
				.setTimestamp();

		return message.channel.send({ embeds: [embed] });
	}
};
