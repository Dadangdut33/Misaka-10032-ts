import { Client, Guild, MessageEmbed, TextChannel } from "discord.js";
import { BotEvent } from "../../../handler";
import { private_Events_Info } from "../../../config.json";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	embedStats(client: Client, guild: Guild, channelID: string, id_embed_serverInfo: string, rulesChannelID: string, modRolesID: string, totalBots: number, onlineUsers: number, age: number) {
		client.channels.fetch(channelID).then((channel) => {
			// First fetch channel from client
			(channel as TextChannel).messages.fetch(id_embed_serverInfo).then((msg) => {
				// Then fetch the message
				let embed = new MessageEmbed()
					.setAuthor({ name: guild.name, iconURL: guild.iconURL({ format: "png", size: 2048 })! })
					.setTitle("Server Information")
					.setDescription(
						`Welcome To ${
							guild.name
						}! This embed contains some information of the server. Before you start participating please read the rules first in <#${rulesChannelID}>. If you have any questions feel free to ask the owner (<@${
							guild.ownerId
						}>) or <@&${modRolesID}>. Once again welcome, have fun, & please enjoy your stay ^^\n\n[[Get Server Icon]](${guild.iconURL({ format: "png", size: 2048 })})`
					)
					.setThumbnail(guild.iconURL({ format: "png", size: 2048 })!)
					.addField("Server Owner", `<@${guild.ownerId}>`, true)
					.addField(`Rules & Guides Channel`, `<#${rulesChannelID}>`, true)
					.addField("Server Age", `${prettyMilliseconds(age)}`, true)
					.addField("Server Permanent Link", `${process.env.Server_invite}`, false)
					.addField("Server Created At", `${moment(guild.createdAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700`, false)
					.addField(`Server Region`, `deprecated`, true)
					.addField("Default Notification", guild.defaultMessageNotifications.toString(), true)
					.addField("AFK Timeout", guild.afkTimeout.toString(), true)
					.addField("Nitro/Booster", `LVL. ${guild.premiumTier}/${guild.premiumSubscriptionCount} Booster(s)`, true)
					.addField("Total Members", guild.memberCount.toString(), true)
					.addField("Total Bots", totalBots.toString(), true)
					.addField("Status (User Only)", `**Online :** ${totalBots}\n**Offline :** ${guild.memberCount - totalBots - onlineUsers}`, false)
					.setColor("RANDOM");

				msg.edit({ embeds: [embed] });
			});
		});
	}

	embedMember(client: Client, channelID: string, memberInfoID: string, onlyTenOldest: string[], onlyTenNewest: string[]) {
		client.channels.fetch(channelID).then((channel) => {
			// First fetch channel from client
			(channel as TextChannel).messages.fetch(memberInfoID).then((msg) => {
				// Then fetch the message
				let embed = new MessageEmbed()
					.setTitle("Showing max 10 of")
					.setDescription(`**Oldest Member**\n${onlyTenOldest.join("\n")}\n\n**Newest Member**\n${onlyTenNewest.join("\n")}`)
					.setFooter({ text: "Last Updated" })
					.setColor("RANDOM")
					.setTimestamp();

				msg.edit({ embeds: [embed] });
			});
		});
	}

	embedNonAnimatedEmojis(client: Client, channelID: string, id_embed_nonanimatedEmojis: string, nonAnimated: string[]) {
		client.channels.fetch(channelID).then((channel) => {
			// First fetch channel from client
			(channel as TextChannel).messages.fetch(id_embed_nonanimatedEmojis).then((msg) => {
				// Then fetch the message
				let embed = new MessageEmbed()
					.setTitle("Server Emojis")
					.setDescription(`**Non Animated**\n${nonAnimated.length > 50 ? nonAnimated.slice(0, 50).join(" ") : nonAnimated.join(" ")}`)
					.setColor("RANDOM");

				if (nonAnimated.length > 50) embed.setFooter({ text: `And ${nonAnimated.length - 50} more...` });

				msg.edit({ embeds: [embed] });
			});
		});
	}

	embedAnimatedEmojis(client: Client, channelID: string, id_embed_animatedEmojis: string, Animated: string[]) {
		client.channels.fetch(channelID).then((channel) => {
			// First fetch channel from client
			(channel as TextChannel).messages.fetch(id_embed_animatedEmojis).then((msg) => {
				// Then fetch the message
				let embed = new MessageEmbed().setDescription(`**Animated**\n${Animated.length > 50 ? Animated.slice(0, 50).join(" ") : Animated.join(" ")}`).setColor("RANDOM");

				if (Animated.length > 50) embed.setFooter({ text: `And ${Animated.length - 50} more...` });

				msg.edit({ embeds: [embed] });
			});
		});
	}

	jump(client: Client, guildID: string, channelID: string, id_embed_serverInfo: string, jumpChannelID: string, jumpToGeneral: string, vcGeneral: string, publicStage: string) {
		client.channels.fetch(channelID).then((channel) => {
			// First fetch channel from client
			(channel as TextChannel).messages.fetch(jumpChannelID).then((msg) => {
				let goTop = `https://discord.com/channels/${guildID}/${channelID}/${id_embed_serverInfo}`;
				// Then fetch the message
				let embed = new MessageEmbed().setTitle("Quick Links").setDescription(`[\[Go To The Top\]](${goTop}) | <#${jumpToGeneral}> | <#${vcGeneral}> | <#${publicStage}>`).setColor("RANDOM");

				msg.edit({ embeds: [embed] });
			});
		});
	}

	getEmoji(guild: Guild) {
		return guild.emojis.cache.map((emojis) => {
			return emojis;
		});
	}

	OnlineUsers(guild: Guild) {
		let totalMemberInGuild = guild.memberCount,
			offline = guild.members.cache.filter((m) => !m.presence).size;

		return totalMemberInGuild - offline;
	}

	totalBots(guild: Guild) {
		let bots = guild.members.cache.filter((m) => m.user.bot).size;

		return bots;
	}

	getMember(guild: Guild) {
		return guild.members.cache.map((GuildMember) => {
			let today = moment().tz("Asia/Jakarta");
			let age = today.valueOf() - GuildMember.joinedAt!.getTime();

			return `${GuildMember.joinedTimestamp} ,, ${moment(GuildMember.joinedAt).tz("Asia/Jakarta").format("DD/MM/YYYY HH:mm:ss")} - <@${GuildMember.id}> (${prettyMilliseconds(age)})`;
		});
	}

	startServerInfoPoll(
		client: Client,
		guildID: string,
		channelID: string,
		rulesChannelID: string,
		modRolesID: string,
		id_embed_serverInfo: string,
		id_embed_nonanimatedEmojis: string,
		id_embed_animatedEmojis: string,
		memberInfoID: string,
		jumpChannelID: string,
		jumpToGeneral: string,
		vcGeneral: string,
		publicStage: string
	) {
		let success = true;
		try {
			// Client, channel id is the id of the channel for all the embed location
			const guild = client.guilds.cache.get(guildID)!; // Server ID
			if (!guild) throw "Guild not found";

			// ------------
			// member
			let onlyTenOldest: string[] = this.getMember(guild)
					.sort()
					.slice(0, 10)
					.map((data, i) => data.replace(/[0-9]+\s,,/g, `[${i + 1}]`)),
				onlyTenNewest: string[] = this.getMember(guild)
					.sort()
					.reverse()
					.slice(0, 10)
					.map((data, i) => data.replace(/[0-9]+\s,,/g, `[${i + 1}]`));

			// ------------
			// emojis
			let emoji = this.getEmoji(guild), // Map the emojis
				nonAnimated: string[] = [],
				Animated: string[] = [];

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

			// ------------
			// Server Age
			let today = moment().tz("Asia/Jakarta"),
				age = today.valueOf() - guild.createdAt.getTime(); // Get server Age

			// ------------
			// update embeds
			this.embedStats(client, guild, channelID, id_embed_serverInfo, rulesChannelID, modRolesID, this.totalBots(guild), this.OnlineUsers(guild), age);
			this.embedNonAnimatedEmojis(client, channelID, id_embed_nonanimatedEmojis, nonAnimated);
			this.embedAnimatedEmojis(client, channelID, id_embed_animatedEmojis, Animated);
			this.embedMember(client, channelID, memberInfoID, onlyTenOldest, onlyTenNewest);
			this.jump(client, guildID, channelID, id_embed_serverInfo, jumpChannelID, jumpToGeneral, vcGeneral, publicStage);
		} catch (error) {
			console.log(error);
			success = false;
		} finally {
			return success;
		}
	}

	run(client: Client) {
		const guildID = private_Events_Info.personalServer.id,
			channelID = "820964768067878922",
			rulesChannelID = "640825665310031882",
			modRolesID = "645494894613233665",
			id_embed_serverInfo = "820964895767265280",
			id_embed_nonanimatedEmojis = "821170444509380639",
			id_embed_animatedEmojis = "821170482945458196",
			memberInfoID = "821205412795383871",
			jumpChannelID = "821206531730571274",
			jumpToGeneral = "640790708155842575",
			vcGeneral = "640790708155842587",
			publicStage = "827086299051196426";

		try {
			const status = this.startServerInfoPoll(
				client,
				guildID,
				channelID,
				rulesChannelID,
				modRolesID,
				id_embed_serverInfo,
				id_embed_nonanimatedEmojis,
				id_embed_animatedEmojis,
				memberInfoID,
				jumpChannelID,
				jumpToGeneral,
				vcGeneral,
				publicStage
			);

			if (status) {
				setInterval(() => {
					this.startServerInfoPoll(
						client,
						guildID,
						channelID,
						rulesChannelID,
						modRolesID,
						id_embed_serverInfo,
						id_embed_nonanimatedEmojis,
						id_embed_animatedEmojis,
						memberInfoID,
						jumpChannelID,
						jumpToGeneral,
						vcGeneral,
						publicStage
					);
				}, 900000); // Every 15 minutes

				console.log(`Module: Server Info Loaded | Loaded from local module | Will update server info every 15 minutes...`);
			} else {
				console.log("Fail to load server info module");
			}
		} catch (e) {
			console.log(e);
		}
	}
};
