import prettyMilliseconds from "pretty-ms";
import moment from "moment-timezone";
import { Message, MessageEmbed } from "discord.js";
import { prefix, build } from "../../../config.json";
import { Command } from "../../../handler";

module.exports = class extends Command {
	constructor() {
		super("uptime", {
			aliases: ["No alias is set for this command"],
			categories: "info-bot",
			info: "Get info of bot's uptime",
			usage: `\`${prefix}uptime\``,
			guildOnly: true,
		});
	}

	async run(message: Message) {
		let embed = new MessageEmbed()
			.addField("Booted up on", `${moment(message.client.readyAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")}`, false)
			.addField("Total Uptime", prettyMilliseconds(message.client.uptime!), false)
			.setFooter("Version " + build + " | TZ +7");

		return message.channel.send(embed);
	}
};
