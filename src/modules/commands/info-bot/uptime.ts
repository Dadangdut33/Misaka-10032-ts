import prettyMilliseconds from "pretty-ms";
import moment from "moment-timezone";
import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	build;
	constructor({ prefix, build }: handlerLoadOptionsInterface) {
		super("uptime", {
			categories: "info-bot",
			info: "Get info of bot's uptime",
			usage: `\`${prefix}command\``,
			guildOnly: true,
		});
		this.build = build;
	}

	async run(message: Message) {
		let embed = new MessageEmbed()
			.addField("Booted up on", `${moment(message.client.readyAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")}`, false)
			.addField("Total Uptime", prettyMilliseconds(message.client.uptime!), false)
			.setFooter({ text: "Version " + this.build + " | TZ +7" });

		return message.channel.send({ embeds: [embed] });
	}
};
