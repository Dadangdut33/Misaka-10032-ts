import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("slowmode", {
			aliases: ["slow"],
			categories: "moderation",
			info: "Activate slowmode to current channe. Limit 21600 (6 hours)",
			usage: `\`${prefix}command/alias <off/seconds> <reason>\``,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[]) {
		message.delete();
		if (args.length < 2) return message.channel.send(`Please provide a reason!`).then((m) => setTimeout(() => m.delete(), 5000));

		let duration: number,
			durGet = args.shift()!.toLowerCase();

		if (durGet === "off") {
			duration = 0;
		} else {
			duration = parseInt(durGet);
			if (isNaN(duration) || duration < 0 || duration > 21600)
				return message.channel
					.send(`Please provide a correct time / number (in seconds) or type 0 or off if you want to turn slowmode off. *Time limit is 21600 (6 hours)`)
					.then((m) => setTimeout(() => m.delete(), 5000));
		}

		(message.channel as TextChannel).setRateLimitPerUser(duration, args.join(` `));
		let embed = new MessageEmbed()
			.setTitle(`Slowmode Has Been ${duration === 0 ? `Deactivated` : `Activated`}`)
			.setColor("#000000")
			.setDescription(`${duration === 0 ? `` : `Duration \`${duration}\` seconds\n`}**Reason:**\`\`\`js\n${args.join(` `)}\`\`\``)
			.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
			.setTimestamp();

		message.channel.send({ embeds: [embed] });
	}
};
