import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import adhan, { Coordinates } from "adhan";
import Moment from "moment-timezone";
import { prefix } from "../../../config.json";
import GraphemeSplitter from "grapheme-splitter";
const cities = require("all-the-cities");

let splitter = new GraphemeSplitter();

module.exports = class extends Command {
	constructor() {
		super("praytime", {
			categories: "muslim",
			aliases: ["pt", "sholat", "adzan"],
			info: "Provide today's praytime, default timezone used are GMT+7. Calculation method using Muslim World League, dependencies used are moment-timezone and adhan. The default coordinate is Ciledug Indonesia but you can enter custom coordinate from google maps or custom city and also custom time zone as you can see in the usage section",
			usage: `**[-]**\`${prefix}command/alias\`\n**[-]**\`${prefix}command/alias <coordinates/coords> <coordinates1 coordinates2> [+/-] [GMT Timezone]\`\n**[-]**\`${prefix}command/alias <city> "<cityname>" [[+/-] [GMT Timezone]] \`-> Notice the " and []`,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) {
			// No parameter
			// Default for local time
			let coordinates = new adhan.Coordinates(-6.175322129297112, 106.82800210012158);

			const { fajrTime, sunriseTime, dhuhrTime, asrTime, maghribTime, ishaTime, current, next, nextPrayer, date_moment, time } = getAdhan(coordinates, "Asia/Jakarta");

			//Send Result
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`Praytime for ${date_moment}`)
				.setDescription("Time provided are based on `GMT+7 Asia/Jakarta`\nCoordinates: `-6.175322129297112, 106.82800210012158`")
				.addField(`Current Prayer Time`, `${current}`, true)
				.addField("Next Prayer", `${next}`, true)
				.addField("Next Prayer in", `${nextPrayer}`, true)
				.addField(`Below are the praytime for today`, "`Current Time: " + time + "`")
				.addFields(
					{
						name: "Fajr",
						value: `${fajrTime}`,
						inline: true,
					},
					{
						name: "Sunrise",
						value: `${sunriseTime}`,
						inline: true,
					},
					{
						name: "Dhuhr",
						value: `${dhuhrTime}`,
						inline: true,
					},
					{
						name: "Asr",
						value: `${asrTime}`,
						inline: true,
					},
					{
						name: "Maghrib",
						value: `${maghribTime}`,
						inline: true,
					},
					{
						name: "Isha",
						value: `${ishaTime}`,
						inline: true,
					}
				)
				.setFooter(`GMT +7 Asia/Jakarta`);

			return message.channel.send(embed);
		} //For User input coordinates
		else if (args[0] == "coordinates" || args[0] == "coords") {
			// COORDINATES
			if (isNaN(parseFloat(args[1])) || isNaN(parseFloat(args[2]))) {
				return errinfo();
			}

			//Get coordinates
			let coordinates = new adhan.Coordinates(parseFloat(args[1].replace(/,/g, ``)), parseFloat(args[2]));

			//Prevent wrong invalid timezone input
			if (parseInt(args[4]) > 13 || parseInt(args[4]) < -12) {
				let embed = new MessageEmbed().setTitle(`Invalid timezone provided`).setDescription(`The valid timezone are range from -12 to +13, that is the rule of physics`).setTimestamp();

				return message.channel.send(embed);
			}

			// Timezone
			let timezone: string = "";
			if (!args[3]) {
				timezone = `-7`;
			} else if (args[3] == "+") {
				timezone = `-${args[4]}`;
			} else if (args[3] == "-") {
				timezone = `+${args[4]}`;
			}

			const { fajrTime, sunriseTime, dhuhrTime, asrTime, maghribTime, ishaTime, current, next, nextPrayer, date_moment, time, zone } = getAdhan(coordinates, timezone);

			// Send Result
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`Praytime for ${date_moment}`)
				.setDescription(`Time provided are based on \`GMT${zone}\`. Default is GMT+7\nCoordinates: \`${parseFloat(args[1].replace(/,/g, ``))}, ${args[2]}\``)
				.addField(`Current Prayer Time`, `${current}`, true)
				.addField("Next Prayer", `${next}`, true)
				.addField("Next Prayer in", `${nextPrayer}`, true)
				.addField(`Below are the praytime for today`, "Current Time: " + time + "`")
				.addFields(
					{
						name: "Fajr",
						value: `${fajrTime}`,
						inline: true,
					},
					{
						name: "Sunrise",
						value: `${sunriseTime}`,
						inline: true,
					},
					{
						name: "Dhuhr",
						value: `${dhuhrTime}`,
						inline: true,
					},
					{
						name: "Asr",
						value: `${asrTime}`,
						inline: true,
					},
					{
						name: "Maghrib",
						value: `${maghribTime}`,
						inline: true,
					},
					{
						name: "Isha",
						value: `${ishaTime}`,
						inline: true,
					}
				)
				.setFooter(`GMT${timezone}`)
				.setTimestamp();

			message.channel.send(embed);

			if (!args[3]) {
				// No custom tz
				info();
			}
		} else if (args[0] == "city") {
			// CITY
			// SEARCH CITY
			let reg = /(["'])(?:(?=(\\?))\2.)*?\1/;
			let search = reg.exec(args.join(" "));

			if (search === null) return errorinfo();
			let searchClear = search[0].replace(/["']/g, "");

			//Get Coordinates
			let result = [];
			result = cities.filter((city: any) => city.name.match(capitalizeTheFirstLetterOfEachWord(searchClear)));
			if (result[0] == undefined) return errorinfo();

			let coord = [];
			coord = result[0].loc.coordinates;

			let coordinates = new adhan.Coordinates(coord[1], coord[0]);

			// tz
			let reg2 = /\[(.*?)\]/;
			let tz = reg2.exec(args.join(" ")); // Clear one on index 1 for some reason
			let splitted: string[] = [];

			if (tz) {
				let tzString = tz[1];

				splitted = splitter.splitGraphemes(tzString);
			}

			//Prevent wrong invalid timezone input
			if (parseInt(splitted[2]) > 13 || parseInt(splitted[2]) < -12) {
				let embed = new MessageEmbed().setTitle(`Invalid timezone provided`).setDescription(`The valid timezone are range from -12 to +13, that is the rule of physics`).setTimestamp();

				return message.channel.send(embed);
			}

			//Get TImezone
			let timezone: string = "";
			if (!splitted[0]) {
				timezone = `-7`;
			} else if (splitted[0] == "+") {
				timezone = `-${splitted[2]}`;
			} else if (splitted[0] == "-") {
				timezone = `+${splitted[2]}`;
			}

			const { fajrTime, sunriseTime, dhuhrTime, asrTime, maghribTime, ishaTime, current, next, nextPrayer, date_moment, time, zone } = getAdhan(coordinates, timezone);

			//Send Result
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`Praytime for ${date_moment}`)
				.setDescription(`Time provided are based on \`GMT${zone}\`. Default is GMT+7\nCity: \`${result[0].name} - ${result[0].country}\`\nCoordinates: \`${coord[1]}, ${coord[0]}\``)
				.addField(`Current Prayer Time`, `${current}`, true)
				.addField("Next Prayer", `${next}`, true)
				.addField("Next Prayer in", `${nextPrayer}`, true)
				.addField(`Below are the praytime for today`, "`Current Time: " + time + "`")
				.addFields(
					{
						name: "Fajr",
						value: `${fajrTime}`,
						inline: true,
					},
					{
						name: "Sunrise",
						value: `${sunriseTime}`,
						inline: true,
					},
					{
						name: "Dhuhr",
						value: `${dhuhrTime}`,
						inline: true,
					},
					{
						name: "Asr",
						value: `${asrTime}`,
						inline: true,
					},
					{
						name: "Maghrib",
						value: `${maghribTime}`,
						inline: true,
					},
					{
						name: "Isha",
						value: `${ishaTime}`,
						inline: true,
					}
				)
				.setFooter(`GMT${zone}`)
				.setTimestamp();

			message.channel.send(embed);
			if (!splitted[0]) {
				info2();
			}
		} else {
			wrongArgs();
		}

		function wrongArgs() {
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`Invalid Arguments Provided!`)
				.setDescription(`For more detailed info please check using the help command. You can enter custom city with custom timezone or custom coordinate with custom timezone`);

			message.channel.send(embed);
		}

		function errinfo() {
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`Invalid coordinate provided!`)
				.setDescription(`For more detailed info please check using the help command. Example :arrow_down:\`\`\`css\n${prefix}pt coordinates 21.403643126916453 39.8159612615235\`\`\``);

			message.channel.send(embed);
		}

		function info() {
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`You can also enter custom timezone`)
				.setDescription(
					`For more detailed info please check using the help command. Example :arrow_down:\`\`\`css\n${prefix}pt coordinates 21.403643126916453 39.8159612615235 + 3\`\`\`Above are example to check praytime in Mecca. If you want to check the timezones of cities you can check using the \`citycoordinate\` command`
				);

			message.channel.send(embed);
		}

		function info2() {
			let embed = new MessageEmbed()
				.setColor("RANDOM")
				.setTitle(`You can also enter custom timezone`)
				.setDescription(
					`For more detailed info please check using the help command. Example :arrow_down:\`\`\`css\n${prefix}pt city "Mecca" [+ 3]\`\`\`Above are example to check praytime in Mecca. If you want to check the timezones of cities you can check using the \`citycoordinate\` command`
				);

			message.channel.send(embed);
		}

		function errorinfo() {
			let embed = new MessageEmbed()
				.setTitle(`Error`)
				.setDescription(`City not found, maybe you type it wrong? Correct example should be like this :arrow_down:\`\`\`css\n${prefix}pt city "Mecca"\`\`\``);

			return message.channel.send(embed);
		}

		function capitalizeTheFirstLetterOfEachWord(words: string) {
			let separateWord = words.toLowerCase().split(" ");
			for (let i = 0; i < separateWord.length; i++) {
				separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
			}
			return separateWord.join(" ");
		}

		function getAdhan(coordinates: Coordinates, timezone: string) {
			// Set Up Data
			let date = new Date(); // Date UTC + 0
			let params = adhan.CalculationMethod.MuslimWorldLeague();
			params.madhab = adhan.Madhab.Shafi;
			let prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

			timezone = timezone === "Asia/Jakarta" ? timezone : `Etc/GMT${timezone}`;

			// Get Praytime
			let fajrTime = Moment(prayerTimes.fajr).tz(timezone).format("h:mm A"),
				sunriseTime = Moment(prayerTimes.sunrise).tz(timezone).format("h:mm A"),
				dhuhrTime = Moment(prayerTimes.dhuhr).tz(timezone).format("h:mm A"),
				asrTime = Moment(prayerTimes.asr).tz(timezone).format("h:mm A"),
				maghribTime = Moment(prayerTimes.maghrib).tz(timezone).format("h:mm A"),
				ishaTime = Moment(prayerTimes.isha).tz(timezone).format("h:mm A"),
				current = prayerTimes.currentPrayer().toString(),
				next = prayerTimes.nextPrayer().toString();

			if (next === "none") next = "fajr";
			let nextPrayer = getNext(current, fajrTime, sunriseTime, dhuhrTime, asrTime, maghribTime, ishaTime);

			//Moment Date Format
			let date_moment = Moment.tz(timezone).format("dddd DD MMMM YYYY");
			let time = Moment.tz(timezone).format("HH:mm:ss");
			let zone = Moment.tz(timezone).format("Z");

			return {
				fajrTime,
				sunriseTime,
				dhuhrTime,
				asrTime,
				maghribTime,
				ishaTime,
				current,
				next,
				nextPrayer,
				date_moment,
				time,
				zone,
			};
		}

		function getNext(current: string, fajrTime: string, sunriseTime: string, dhuhrTime: string, asrTime: string, maghribTime: string, ishaTime: string) {
			let next = "";
			if (current == "fajr") {
				next = sunriseTime;
			} else if (current == "sunrise") {
				next = dhuhrTime;
			} else if (current == "dhuhr") {
				next = asrTime;
			} else if (current == "asr") {
				next = maghribTime;
			} else if (current == "maghrib") {
				next = ishaTime;
			} else if (current == "isha") {
				next = fajrTime;
			}

			return next;
		}
	}
};
