import prettyMilliseconds from "pretty-ms";
import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix, build, Repo_Link } from "../../../config.json";

module.exports = class extends Command {
	constructor() {
		super("about", {
			categories: "info-bot",
			aliases: [],
			info: "Shows what the bot is about. This include the bot's status & description",
			usage: `\`${prefix}about\``,
			guildOnly: true,
		});
	}
	async run(message: Message, args: string[]) {
		const embed = new MessageEmbed()
			.setTitle("Hello there!")
			.setColor("YELLOW")
			.setThumbnail(message.client!.user!.displayAvatarURL())
			.setDescription(
				`My name is **Misaka 10032** *says Misaka, trying to explain herself* jk...\n\nCreated by Dadangdut33 **for private use only**.\n\n**[Click here to see my source code](${Repo_Link})** \n*The bot is currently being rewritten in typescript`
			)
			.addField("TOTAL SERVERS/\nCHANNELS", `${message.client.guilds.cache.size}/${message.client.channels.cache.size}`, true)
			.addField("TOTAL MEMBERS", message.client.users.cache.size, true)
			.addField("PRESENCE", message.client!.user!.presence.activities[0] ? message.client!.user!.presence.activities[0].name : `No presence set`, true)
			.addField("ID", message.client.user!.id, true)
			.addField("UPTIME", prettyMilliseconds(message.client.uptime!), true)
			.addField("STATUS", message.client!.user!.presence.status, true)
			.addField("CREATOR", "Dadangdut33#5411", true)
			.addFields({
				name: "Dadang's Github Account",
				value: `[Github](https://github.com/Dadangdut33)`,
				inline: true,
			})
			.setFooter(`Version ${build}`)
			.setTimestamp();

		message.channel.send(embed);
	}
};
