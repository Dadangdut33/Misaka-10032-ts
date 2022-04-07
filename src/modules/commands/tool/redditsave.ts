import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { load } from "cheerio";
import axios from "axios";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("redditsave", {
			categories: "tool",
			info: "Get media download links of a reddit post using webscraper and [redditsave](https://redditsave.com/)",
			usage: `${prefix}command/alias <post link>`,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send("Error! Please provide a valid reddit post url.");

		let link = `https://redditsave.com/info?url=${args[0]}`;

		//Fetching the HTML using axios
		let { data } = await axios.get(link);
		let $ = load(data); //Using cheerio to load the HTML fetched

		//Fetching the title of the site
		let errorMsg = $('div[class = "alert alert-danger"]').text();

		if (errorMsg) return message.channel.send("Error! Please provide a valid reddit post url.");

		// Get the downloadinfo
		let downloadLink = $('div[class = "download-info"]').html()!,
			takenlink = downloadLink.match(/href=(["'])(?:(?=(\\?))\2.)*?\1/)!, // Match the link from href=
			linkOnly = takenlink.join("").match(/(["'])(?:(?=(\\?))\2.)*?\1/)!; // Match the original link now

		let directLink;
		// Is there no media?
		if (args[0] == linkOnly.join("").replace(/("|amp;)/g, "")) directLink = `No media to download`;
		else directLink = `[Click Here](${linkOnly.join("").replace(/("|amp;)/g, "")})`;

		const embed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
			.setTitle(`Original Reddit Link`)
			.setDescription(args[0])
			.addField(`Direct Download Link`, directLink, true) // Replace the thing in the way
			.addField(`More Options`, `[RedditSave](${link})`, true)
			.setFooter({ text: `Via redditsave.com` })
			.setColor("#FF4500")
			.setTimestamp();

		return message.channel.send({ embeds: [embed] });
	}
};
