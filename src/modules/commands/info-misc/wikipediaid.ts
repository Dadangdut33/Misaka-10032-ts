import { MessageEmbed, Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import axios from "axios";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("wikipediaid", {
			aliases: ["wikiid", "wikid"],
			categories: "info-misc",
			info: "Finds an English Wikipedia Article by title.",
			usage: `\`${prefix}command/alias <...>\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		if (!args[0]) return message.channel.send("Please provide a valid input.");

		const query = args.join(`_`);

		const footer = `Requested by ${message.author.username}`,
			footerpic = message.author.displayAvatarURL(),
			author = "© Wikipedia.org",
			authorpic = "https://i.imgur.com/fnhlGh5.png",
			authorlink = "https://id.wikipedia.org/",
			url = "https://id.wikipedia.org/api/rest_v1/page/summary/",
			link = url + query;

		try {
			const { data } = await axios.get(link);

			let embed = new MessageEmbed()
				.setAuthor({ name: author, iconURL: authorpic, url: authorlink })
				.setColor("RANDOM")
				.setDescription(`${data.extract}`)
				.setFooter({ text: footer, iconURL: footerpic })
				.setThumbnail(`${data.thumbnail ? data.thumbnail.source : ""}`)
				.setTitle(`${data.title}`)
				.setURL(`${data.content_urls.desktop.page}`)
				.setTimestamp();

			return message.channel.send({ embeds: [embed] });
		} catch (error: any) {
			if (error.response.status === 403) return message.channel.send("Wikipedia is down, try again later.");
			if (error.response.status === 404) return message.channel.send(`I couldn't find that article on Wikipedia or maybe you type it wrong?`);
			else {
				console.log(error);
				return message.channel.send(`Error ${error}`);
			}
		}
	}
};
