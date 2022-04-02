import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import axios from "axios";
// import cheerio from "cheerio";
import { load } from "cheerio";
// const cheerio = require("cheerio");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("sauce", {
			categories: "anime-misc",
			aliases: ["source"],
			info: "Get an image source by using [saucenao](https://saucenao.com/)",
			usage: `${prefix}command/alias [url/image]\`\`\`**Or You can reply to a message that has an image with**\`\`\`${prefix}command/alias`,
			guildOnly: true,
		});
	}

	getDomainName(url: string) {
		let domain = url.split("/")[2];

		return domain.replace(/^www\./, "");
	}

	async run(message: Message, args: string[]) {
		const replaceChar: any = { "/": "%2F", ":": "%3A" };
		let ref, refMsg, url_or_attachment, link;

		const msgLoading = await message.channel.send("**Fetching message...**");

		// Getting the image
		if (args.length === 0) {
			// check if message is replying or not
			if (message.reference) {
				// fetch message by  id
				ref = message.reference;
				refMsg = await message.channel.messages.fetch(ref.messageID!).then((msg) => msg);

				if (refMsg.attachments.size > 0) {
					// get attachment
					url_or_attachment = refMsg.attachments.first()!.url;
				} else {
					// get url
					url_or_attachment = refMsg.content;
					// regex match img url
					let regex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp))/gi;
					let match = regex.exec(url_or_attachment);
					if (match) url_or_attachment = match[0];
				}
			} else {
				// if not reply
				url_or_attachment = message.attachments.first()!.url;
			}

			// check if attachment is empty
			if (!url_or_attachment || url_or_attachment.match(/\.(jpeg|jpg|gif|png)$/) == null)
				return message.channel.send(`**Please input a valid image url or reply to a message that has an image.**`);

			link = `https://saucenao.com/search.php?db=999&url=${url_or_attachment.replace(/[:/]/g, (m) => replaceChar[m])}`;
		} else {
			// not a reply to mesage
			// check if input is a valid image url or not
			if (args[0].match(/\.(jpeg|jpg|gif|png)$/) == null) return message.channel.send(`**Please input a valid image url or reply to a message that has an image.**`);
			link = `https://saucenao.com/search.php?db=999&url=${args[0].replace(/[:/]/g, (m) => replaceChar[m])}`;
			url_or_attachment = args[0];
		}

		// edit mg
		msgLoading.edit("**Fetching data from SauceNao...**");

		// Fetching the HTML using axios
		let { data } = await axios.get(link),
			$ = load(data), // Using cheerio to load the HTML fetched
			results = $(".resulttablecontent"), // get all the elements with class "resulttablecontent"
			limit = results.length;

		if (limit > 10) limit = 10; // limit the results to 10

		// get top 5 results and store in array, after that remove element that is from the same source
		let results_array = [], // [0] = domain, [1] = link img, [3] = similarity percentage
			imgLink,
			similarityPercentage;
		for (let i = 0; i < limit; i++) {
			imgLink = $(results[i]).find(".resultcontentcolumn").find("a").attr("href")!;
			similarityPercentage = $(results[i]).find(".resultsimilarityinfo").text();

			// result is in <a></a>
			try {
				results_array.push([this.getDomainName(imgLink), imgLink, similarityPercentage]);
			} catch (e) {} // ignored
		}

		// remove duplicate, furaffinity, percentage < 70
		results_array = results_array.filter((v, i, a) => a.findIndex((t) => t[0] === v[0]) === i && v[0] !== "furaffinity.net" && parseInt(v[2].split("%")[0]) > 69);

		msgLoading.edit("**Loading Finished!**");
		msgLoading.delete({
			timeout: 1000,
		});

		const embed = new MessageEmbed() // create embed
			.setColor("0096fa")
			.setTitle(`🥫 Found ${results_array.length} results`)
			.setDescription(`[See Full Result](${link})`)
			.setImage(url_or_attachment)
			.setFooter(`Via SauceNao.com | Use top result for accurate result.`);

		if (results_array.length > 1) {
			embed.addField(`Top Result (${results_array[0][2]})`, `[${results_array[0][0]}](${results_array[0][1]})`);
			embed.addField(
				`Other Results (Might not be accurate)`,
				results_array
					.slice(1, results_array.length) // get the rest of the result
					.map((v) => `[${v[0]} (${v[2]})](${v[1]})`)
					.join(" | ")
			);
		} else if (results_array.length === 0) {
			// no result found
			embed.addField(`No Result found`, `Results found has less than 70% similarity. You can check full result for more info.`);
		} else {
			// only 1 result
			embed.addField(`Top Result (${results_array[0][2]})`, `[${results_array[0][0]}](${results_array[0][1]})`);
		}

		// send embed
		return message.channel.send(embed);
	}
};
