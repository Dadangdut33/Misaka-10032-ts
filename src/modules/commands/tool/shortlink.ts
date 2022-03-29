import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import moment from "moment-timezone";
const request = require("request");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("shortlink", {
			aliases: ["shorten", "bitly"],
			categories: "tool",
			info: "Shorten a link using [bitly API](https://dev.bitly.com/api-reference) The API has limits of 1000 calls per hour and 100 calls per minute [Read more](https://dev.bitly.com/docs/getting-started/rate-limits/)",
			usage: `\`${prefix}command/alias <link that you want to shorten>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0])
			return message.channel.send({
				embed: {
					color: "EE6123",
					description: `Please enter a valid url! Correct link should contain the protocol, Ex: https://youtube.com/`,
				},
			});

		// Authorization
		let headers = {
			Authorization: `Bearer ${process.env.BitlyKey}`, //Token from https://app.bitly.com/
			"Content-Type": "application/json",
		};

		// Data to be shorten
		let dataString = `{ "long_url": "${args[0]}", "domain": "bit.ly"}`;

		// Call the API
		let options = {
			url: "https://api-ssl.bitly.com/v4/shorten",
			method: "POST",
			headers: headers,
			body: dataString,
		};

		// Callback
		function callback(error: any, response: any, body: any) {
			if (response.statusCode == 200 || response.statusCode == 201) {
				//200 success 201 created
				let shorten = JSON.parse(body); // Parse data to json type so it can be stored easily

				message.delete();
				let embed = new MessageEmbed()
					.setAuthor(message.author.username, message.author.displayAvatarURL({ format: "jpg", size: 2048 }))
					.setColor("EE6123")
					.setTitle(`Shortlink Created!`)
					.addField(`Original Link`, `${args[0]}`, false)
					.addField(`Shorten Link`, `${shorten.link}`, false)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.addField("Created On", `${moment(shorten.created_at).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700 (Western Indonesia Time)`)
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 429) {
				// Rate limit
				let res = JSON.parse(body); // Parse data to json type so it can be stored easily

				let embed = new MessageEmbed()
					.setTitle(`RATE LIMIT REACHED STATUS CODE 429`)
					.setDescription(`Rate Limit Reached! Pls try again in a few hours`)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 400) {
				// BAD_REQUEST
				let embed = new MessageEmbed()
					.setTitle(`BAD_REQUEST STATUS CODE 400`)
					.setDescription(`Please enter a valid url! Correct link should contain the protocol, Ex: :arrow_down:\`\`\`html\nhttps://youtube.com/\`\`\``)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 403) {
				// FORBIDDEN
				let embed = new MessageEmbed()
					.setTitle(`FORBIDDEN STATUS CODE 403`)
					.setDescription(`FORBIDDEN! (Token Problem) pls contact admin to check the problem`)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 417) {
				// EXPECTATION_FAILED
				let embed = new MessageEmbed()
					.setTitle(`EXPECTATION_FAILED STATUS CODE 417`)
					.setDescription(`EXPECTATION_FAILED! pls contact admin to check the problem`)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 422) {
				// UNPROCESSABLE_ENTITY
				let embed = new MessageEmbed()
					.setTitle(`UNPROCESSABLE_ENTITY STATUS CODE 422`)
					.setDescription(`UNPROCESSABLE_ENTITY! Pls contact admin to check the problem`)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 500) {
				// INTERNAL_ERROR
				let embed = new MessageEmbed()
					.setTitle(`INTERNAL_ERROR STATUS CODE 500`)
					.setDescription(`INTERNAL_ERROR! bit.ly is probably having some kind of problem, pls contact admin just in case`)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (response.statusCode == 503) {
				// TEMPORARILY_UNAVAILABLE
				let embed = new MessageEmbed()
					.setTitle(`TEMPORARILY_UNAVAILABLE STATUS CODE 503`)
					.setDescription(`TEMPORARILY_UNAVAILABLE! bit.ly is down at the moment`)
					.setFooter(`bit.ly`, "https://cdn.discordapp.com/attachments/799595012005822484/810405681278222336/On9ZnfVh.png")
					.setColor("EE6123")
					.setTimestamp();

				return message.channel.send(embed);
			} else if (error == null) {
				let embed = new MessageEmbed()
					.setDescription(`Please enter a valid url! Correct link should contain the protocol, Ex: :arrow_down:\`\`\`html\nhttps://youtube.com/\`\`\``)
					.setColor("EE6123");

				return message.channel.send(embed);
			} else {
				return message.channel.send(`Uncaught Error: ${error}`);
			}
		}

		request(options, callback); // Call the request
	}
};
