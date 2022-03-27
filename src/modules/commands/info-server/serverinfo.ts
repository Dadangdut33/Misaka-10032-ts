import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";

module.exports = class extends Command {
	constructor() {
		super("serverinfo", {
			aliases: ["sinfo"],
			categories: "info-server",
			info: "Get current server info",
			usage: `${prefix}command/alias`,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		const guild = message.guild!;
		if (!args[0]) {
			let emoji = getEmoji(); // Map the emojis

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
				.setAuthor(guild.name, guildIcon, `https://discord.com/channels/${guild.id}`)
				.setTitle(`Server Information`)
				.setDescription(`[Get Server Icon](${guildIcon})`)
				.addField("Server ID", guild.id, true);

			// ppw invite link
			if (guild.id === "640790707082231834") embed.addField("Permanent Invite Link", process.env.Server_invite, true);

			embed
				.addField("Owner", "<@" + guild.ownerID + ">", false)
				.addField("Server Name", guild.name, true)
				.addField("Region", guild.region, true)
				.addField("Members/Online", `${guild.memberCount}/${OnlineUsers()}`, true)
				.addField("Default Notification", guild.defaultMessageNotifications, true)
				.addField("AFK Timeout", guild.afkTimeout, true)
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
				.setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ format: "jpg", size: 2048 }))
				.setTimestamp();

			message.channel.send(embed);
		}

		function OnlineUsers() {
			let users = guild.members.cache.filter((m) => m.user.presence.status === "online").size;
			users += guild.members.cache.filter((m) => m.user.presence.status === "idle").size;
			users += guild.members.cache.filter((m) => m.user.presence.status === "dnd").size;
			return users;
		}

		function getEmoji() {
			return guild.emojis.cache.map((emojis) => {
				return emojis;
			});
		}
	}
};
