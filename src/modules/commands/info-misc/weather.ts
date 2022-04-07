import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import moment from "moment-timezone";
const weather = require("weather-js");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("weather", {
			categories: "info-misc",
			info: "Gives weather information of given location",
			usage: `\`${prefix}command <location>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args.length) return message.channel.send("Please enter location that you want to observe");

		weather.find({ search: args.join(" "), degreeType: "C" }, function (err: any, result: any) {
			try {
				let time = moment.tz("Asia/Jakarta").format("dddd, YYYY-MM-D (HH:mm:ss)");

				let embed = new MessageEmbed()
					.setTitle(`Showing Weather Condition of ${result[0].location.name} (${result[0].current.date})`)
					.setColor("RANDOM")
					.setDescription("Results may not be 100% accurate")
					.addField("Lat/Long", `${result[0].location.lat}/${result[0].location.long}`, true)
					.addField("Timezone", `${result[0].location.timezone}`, true)
					.addField("Alert", `${result[0].location.alert ? result[0].location.alert : "-"}`, true)
					.addField("Temperature/Feels Like", `${result[0].current.temperature}°C/${result[0].current.feelslike}°C`, true)
					.addField("Sky", result[0].current.skytext, true)
					.addField("Humidity", result[0].current.humidity, true)
					.addField("Wind", result[0].current.winddisplay, true)
					.addField("Observation Time", result[0].current.observationtime, true)
					.addField("Observation Point", result[0].current.observationpoint, true)
					.addField(`\`\`\`Current Date & Time: ${time}\`\`\``, `**5 days forecast**`, false)
					.setThumbnail(result[0].current.imageUrl);

				for (let i = 0; i < result[0].forecast.length; i++) {
					embed.addField(
						`${result[0].forecast[i].day}`,
						`Date: ${result[0].forecast[i].date}\nLow: ${result[0].forecast[i].low}\nHigh: ${result[0].forecast[i].low}\nSky: ${result[0].forecast[i].skytextday}\nPrecip: ${
							result[0].forecast[i].precip ? result[0].forecast[i].precip : "-"
						}`,
						true
					);
				}
				embed.addField(`Source`, `[MSN](https://www.msn.com/)`, true);
				embed.setFooter({ text: `Date Format: (Year-Month-Day)` });

				return message.channel.send({ embeds: [embed] });
			} catch (err) {
				console.log(err);
				return message.channel.send(`Unable to get data of the given location\n\n**Details:** ${err}`);
			}
		});
	}
};
