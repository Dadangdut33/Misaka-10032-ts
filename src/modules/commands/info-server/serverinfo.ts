import { MessageEmbed, Message, GuildMember, Guild } from "discord.js";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("serverinfo", {
			aliases: ["sinfo"],
			categories: "info-server",
			info: "Get current server info",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	OnlineUsers(guild: Guild) {
		let totalMemberInGuild = guild.memberCount,
			offline = guild.members.cache.filter((m) => !m.presence).size;

		return totalMemberInGuild - offline;
	}

	getEmoji(guild: Guild) {
		return guild.emojis.cache.map((emojis) => {
			return emojis;
		});
	}

	async run(message: Message, args: string[]) {
		const guild = message.guild!;
		let emoji = this.getEmoji(guild); // Map the emojis

		let nonAnimated = [];
		let Animated = [];
		if (emoji.length === 0) {
			nonAnimated.push("No custom emoji in server");
			Animated.push("-");
		} else {
			for (let i = 0; i < emoji.length; i++) {
				if (emoji[i].animated) {
					Animated.push(`<a:${emoji[i].name}:${emoji[i].id}>`);
				} else {
					nonAnimated.push(`<:${emoji[i].name}:${emoji[i].id}>`);
				}
			}
		}

		const guildIcon = guild.iconURL({ format: "png", size: 2048 })!;
		// Age
		let today = moment().tz("Asia/Jakarta");
		let age = today.valueOf() - guild.createdAt.getTime();

		let embed = new MessageEmbed()
			.setThumbnail(guildIcon)
			.setAuthor({ name: guild.name, iconURL: guildIcon, url: `https://discord.com/channels/${guild.id}` })
			.setTitle(`Server Information`)
			.setDescription(`[Get Server Icon](${guildIcon})`)
			.addField("Server ID", guild.id, true);

		// ppw invite link
		if (guild.id === "640790707082231834") embed.addField("Permanent Invite Link", process.env.Server_invite!, true);

		embed
			.addField("Owner", "<@" + guild.ownerId + ">", false)
			.addField("Server Name", guild.name, true)
			.addField("Region", `Deprecated`, true)
			.addField("Members/Online", `${guild.memberCount}/${this.OnlineUsers(guild)}`, true)
			.addField("Default Notification", guild.defaultMessageNotifications.toString(), true)
			.addField("AFK Timeout", guild.afkTimeout.toString(), true)
			.addField("Nitro Lvl/Supporter", `${guild.premiumTier}/${guild.premiumSubscriptionCount}`, true)
			.addField("Emojis (Max shown 50)", nonAnimated.length > 0 ? nonAnimated.slice(0, 25).join(" ") : `-`, false);

		// >25
		if (nonAnimated.length > 25) embed.addField("Cont.", nonAnimated.length > 25 ? nonAnimated.slice(25, 50).join(" ") : `-`, false);

		// animated
		embed.addField("Animated Emojis", Animated.length > 0 ? Animated.slice(0, 25).join(" ") : `-`, false);
		if (nonAnimated.length > 25) embed.addField("Cont.", Animated.length > 25 ? Animated.slice(25, 50).join(" ") : `-`, false);

		// rest of the stuff
		embed
			.addField("Server Age", `${prettyMilliseconds(age)}`, false)
			.addField("Created On", `${moment(guild.createdAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700 (Western Indonesia Time)`, false)
			.addField("You Joined At", `${moment(message.member!.joinedAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700 (Western Indonesia Time)`, false)
			.setColor("RANDOM")
			.setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
			.setTimestamp();

		return message.channel.send({ embeds: [embed] });
	}
};
