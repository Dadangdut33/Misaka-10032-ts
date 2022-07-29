import { Client, MessageEmbed, TextChannel } from "discord.js";
import Parser from "rss-parser";
import { BotEvent } from "../../../handler";
import { find_DB_Return, insert_collection, updateOne_Collection } from "../../../utils";
import { private_Events_Info } from "../../../config.json";
const parser = new Parser();

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	async run_nyaa(guild_ID: string, channel: TextChannel) {
		const feed = await parser.parseURL("https://nyaa.si/?page=rss");

		// check if guild is registered in db
		const check = await find_DB_Return("nyaa", { gId: guild_ID });
		if (check.length === 0) {
			// if not, insert/register it and no need to slice the feed
			await insert_collection("nyaa", { gId: guild_ID, last_Nyaa: feed.items[0].guid });
		} else {
			// cut feed from 0 to last found
			let limit = 15,
				index = -1,
				counter = 0;
			const last_Nyaa = check[0].last_Nyaa,
				splittedNyaa = last_Nyaa.split("/"),
				baseLink = splittedNyaa.slice(0, splittedNyaa.length - 1).join("/");

			// get index of last found
			// in a while loop because item can sometimes already removed from feed
			while (index === -1) {
				index = feed.items.findIndex((item) => item.guid === baseLink + "/" + `${parseInt(splittedNyaa[splittedNyaa.length - 1]) - counter}`);

				counter++;
				if (counter === limit) break;
			}

			// update db
			await updateOne_Collection("nyaa", { gId: guild_ID }, { $set: { last_Nyaa: feed.items[0].guid } });

			// if index is -1, then last found is not found in feed which means no cut
			// slice feed from 0 to last found
			if (index !== -1) feed.items = feed.items.slice(0, index);
		}

		feed.items.reverse(); // reverse it first so it will be in correct order
		if (feed.items.length === 0) return; // if feed is empty, then no new item and no need to send message

		let embedList = [];
		// iterate through feed and send rss info
		for (const item of feed.items) {
			const embed = new MessageEmbed()
				.setAuthor({ name: "Nyaa.si", url: "https://nyaa.si/", iconURL: "https://media.discordapp.net/attachments/799595012005822484/1002247072738705499/fH1dmIuo_400x400.jpg" })
				.setTitle(item.title ? item.title : "Title not found")
				.setURL(item.guid!)
				.setDescription(item.contentSnippet ? item.contentSnippet : "Contentsnippet not found")
				.addField("Download", `[Torrent](${item.link})`, true)
				.addField("Published at", item.isoDate ? `<t:${new Date(item.isoDate).valueOf() / 1000}>` : item.pubDate ? item.pubDate : "Date published at not found", true)
				.setColor("#0099ff")
				.setFooter({ text: `${feed.title}` })
				.setTimestamp();

			embedList.push(embed);

			if (embedList.length === 10) {
				channel.send({ embeds: embedList });
				embedList = [];
			}
		}

		if (embedList.length > 0) {
			channel.send({ embeds: embedList });
		}
	}

	// spotlight a message from a guild in any channel
	async run(client: Client) {
		const guild_ID = private_Events_Info.personalServer.id,
			highlightChannel = private_Events_Info.personalServer.channel_nyaa;

		// get guild by id
		const guild = client.guilds.cache.get(guild_ID);
		if (!guild) return console.log("Invalid guild for Nyaa rss feed");

		// get channel by id
		const channel = guild.channels.cache.get(highlightChannel) as TextChannel;
		if (!channel) return console.log("Invalid channel Nyaa rss feed");

		console.log(`Module: Nyaa rss feed | Guild: ${guild.name}`);
		console.log(`Module: Nyaa rss feed | Loading feed`);
		// run nyaa on startup
		try {
			await this.run_nyaa(guild_ID, channel);
		} catch (e) {
			console.log(`[${new Date().toLocaleString()}] [ERROR] [nyaa] startup fail to run nyaa rss feed`);
			console.log(e);
		}
		// interval every .5 hour
		setInterval(async () => {
			try {
				await this.run_nyaa(guild_ID, channel);
			} catch (e) {
				console.log(`[${new Date().toLocaleString()}] [ERROR] [nyaa]`);
				console.log(e);
			}
		}, 1800000);

		console.log(`Module: Nyaa rss feed | Feed loaded`);
	}
};
