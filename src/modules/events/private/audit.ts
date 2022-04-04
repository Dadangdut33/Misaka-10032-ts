// Forked for personal use From https://www.npmjs.com/package/discord-auditlog

import { Client, Guild, MessageEmbedOptions, TextChannel } from "discord.js";
import { BotEvent } from "../../../handler";
const debugmode = false;

interface optionsInterface {
	[key: string]: {
		auditlog: string;
		auditmsg: string;
	};
}

interface sendOptionsInterface {
	auditlog: string | boolean | undefined;
	auditmsg: string | boolean | undefined;
}

function AuditLog(client: Client, options: optionsInterface) {
	const description = {
		name: "audit",
		filename: "audit.ts",
		version: "2.0.0",
	};

	const eventtype: any = {
		guildMemberUpdate: "auditlog",
		usernameChangedMsg: "auditlog",
		discriminatorChangedMsg: "auditlog",
		avatarChangedMsg: "auditlog",
		messageDelete: "auditmsg",
	};

	console.log(`Module: ${description.name} | Loaded version ${description.version} from ("${description.filename}")`);

	// Deleted image
	// Only if the message contains image
	client.on("messageDelete", (message) => {
		if (message.author) if (message.author.client) return;
		if (message.channel.type !== "text") return;
		if (message.attachments.map((x) => x.proxyURL).length == 0) return;
		if (debugmode) console.log(`Module: ${description.name} | messageDelete triggered`);

		let embed = {
			description: `
**Author : ** <@${message.author!.id}> - *${message.author!.tag}*
**Date : ** ${message.createdAt}
**Channel : ** <#${message.channel.id}> - *${message.channel.name}*

**Deleted Image : **
${message.attachments.map((x) => x.proxyURL)}
`,
			image: {
				url: message.attachments.map((x) => x.proxyURL)[0],
			},
			color: "#000",
			timestamp: new Date(),
			footer: {
				text: `Deleted `,
			},
			author: {
				name: `IMAGE DELETED `,
				icon_url: "https://cdn.discordapp.com/emojis/619328827872641024.png",
			},
		};

		if (message && message.member && typeof message.member.guild === "object") {
			send(client, message.member.guild, options, embed, "messageDelete");
		} else {
			console.error(`Module: ${description.name} | messageDelete - ERROR - member guild id couldn't be retrieved`);
			console.error("author", message.author);
			console.error("member", message.member);
			console.error("content", message.content);
		}
	});

	// USER NICKNAME UPDATE
	client.on("guildMemberUpdate", (oldMember, newMember) => {
		if (debugmode) console.log(`Module: ${description.name} | guildMemberUpdate:nickname triggered`);
		if (oldMember.nickname !== newMember.nickname) {
			let embed = {
				description: `<@${newMember.user.id}> - *${newMember.user.id}*`,
				url: newMember.user.displayAvatarURL({ format: "png", size: 2048 }),
				color: "#000",
				timestamp: new Date(),
				footer: {
					text: `${newMember.nickname || newMember.user.username}`,
				},
				thumbnail: {
					url: newMember.user.displayAvatarURL({ format: "png", size: 2048 }),
				},
				author: {
					name: `NICKNAME CHANGED: ${newMember.user.tag}`,
					icon_url: "https://cdn.discordapp.com/emojis/435119397237948427.png",
				},
				fields: [
					{
						name: "Old Nickname",
						value: `**${oldMember.nickname || oldMember.user!.username}**`,
						inline: true,
					},
					{
						name: "New Nickname",
						value: `**${newMember.nickname || newMember.user.username}**`,
						inline: true,
					},
				],
			};
			send(client, newMember.guild, options, embed, "guildMemberUpdate");
		}
	});

	// USER UPDATE AVATAR, USERNAME, DISCRIMINATOR
	client.on("userUpdate", (oldUser, newUser) => {
		if (debugmode) console.log(`Module: ${description.name} | userUpdate triggered`);

		// Log type
		let usernameChangedMsg: MessageEmbedOptions | null = null,
			discriminatorChangedMsg: MessageEmbedOptions | null = null,
			avatarChangedMsg: MessageEmbedOptions | null = null;

		// search the member from all guilds, since the userUpdate event doesn't provide guild information as it is a global event.
		client.guilds.cache.forEach(function (guild, guildid) {
			guild.members.cache.forEach(function (member, memberid) {
				if (newUser.id === memberid) {
					// USERNAME CHANGED
					if (oldUser.username !== newUser.username) {
						if (debugmode) console.log(`Module: ${description.name} | userUpdate:USERNAME triggered`);

						usernameChangedMsg = {
							description: `<@${newUser.id}> - *${newUser.id}*`,
							url: newUser.displayAvatarURL({ format: "png", size: 2048 }),
							color: 0x000,
							timestamp: new Date().getTime(),
							footer: {
								text: `${member.nickname || member.user.username}`,
							},
							thumbnail: {
								url: newUser.displayAvatarURL({ format: "png", size: 2048 }),
							},
							author: {
								name: `USERNAME CHANGED: ${newUser.tag}`,
								icon_url: "https://cdn.discordapp.com/emojis/435119402279763968.png",
							},
							fields: [
								{
									name: "Old Username",
									value: `**${oldUser.username}**`,
									inline: true,
								},
								{
									name: "New Username",
									value: `**${newUser.username}**`,
									inline: true,
								},
							],
						};
					}

					// DISCRIMINATOR CHANGED
					if (oldUser.discriminator !== newUser.discriminator) {
						if (debugmode) console.log(`Module: ${description.name} | userUpdate:DISCRIMINATOR triggered`);

						discriminatorChangedMsg = {
							description: `<@${newUser.id}> - *${newUser.id}*`,
							url: newUser.displayAvatarURL({ format: "png", size: 2048 }),
							color: 0x000,
							timestamp: new Date().getTime(),
							footer: {
								text: `${member.nickname || member.user.username}`,
							},
							thumbnail: {
								url: newUser.displayAvatarURL({ format: "png", size: 2048 }),
							},
							author: {
								name: `DISCRIMINATOR CHANGED: ${newUser.tag}`,
								icon_url: "https://cdn.discordapp.com/emojis/435119390078271488.png",
							},
							fields: [
								{
									name: "Old Discriminator",
									value: `**${oldUser.discriminator}**`,
									inline: true,
								},
								{
									name: "New Discriminator",
									value: `**${newUser.discriminator}**`,
									inline: true,
								},
							],
						};
					}

					// AVATAR CHANGED
					if (oldUser.avatar !== newUser.avatar) {
						if (debugmode) console.log(`Module: ${description.name} | userUpdate:AVATAR triggered`);

						avatarChangedMsg = {
							description: `<@${newUser.id}> - *${newUser.id}*\n\n**Old Avatar** :arrow_down:`,
							url: newUser.displayAvatarURL({ format: "png", size: 2048 }),
							color: 0x000,
							timestamp: new Date().getTime(),
							footer: {
								text: `Old avatar might not show up sometimes`,
							},
							thumbnail: {
								url: newUser.displayAvatarURL({ format: "png", size: 2048 }),
							},
							author: {
								name: `AVATAR CHANGED: ${newUser.tag}`,
								icon_url: "https://cdn.discordapp.com/emojis/435119382910337024.png",
							},
							image: {
								url: oldUser.displayAvatarURL({ format: "png", size: 2048 }),
							},
						};
					}

					if (usernameChangedMsg) send(client, guild, options, usernameChangedMsg, "usernameChangedMsg");
					if (discriminatorChangedMsg) send(client, guild, options, discriminatorChangedMsg, "discriminatorChangedMsg");
					if (avatarChangedMsg) send(client, guild, options, avatarChangedMsg, "avatarChangedMsg");
				}
			});
		});
	});

	// SEND FUNCTION
	function send(client: Client, guild: Guild, options: optionsInterface, msg: MessageEmbedOptions, movement: string) {
		let embed,
			theOptions: sendOptionsInterface = {
				auditlog: "",
				auditmsg: "",
			};

		// debug
		if (debugmode) console.log(`Module: ${description.name} | send - configured options:`, options);

		if (!options)
			theOptions = {
				auditlog: undefined,
				auditmsg: undefined,
			}; // Initialize option if empty
		if (options[guild.id]) theOptions = options[guild.id]; // Initialize if options are multi-server

		// debug
		if (debugmode) console.log(`Module: ${description.name} | send - specifics options:`, options);

		// Add default channel
		if (typeof theOptions.auditlog === "undefined") theOptions.auditlog = false;
		if (typeof theOptions.auditmsg === "undefined") theOptions.auditmsg = false;

		if (debugmode) console.log(`Module: ${description.name} | send - computed options:`, options);

		// get channelname
		const channelname = options[eventtype[movement]] as unknown as string;
		if (channelname) {
			// define channel object
			const channel = guild.channels.cache.find((val) => val.name === channelname) || guild.channels.cache.find((val) => val.id === channelname);
			if (channel) {
				if (channel.permissionsFor(client.user!)!.has("SEND_MESSAGES")) {
					if (typeof msg === "object") {
						// Embed
						if (channel.permissionsFor(client.user!)!.has("EMBED_LINKS")) {
							embed = msg;
							(channel as TextChannel).send({ embed }).catch(console.error);
						} else {
							console.log(
								`${description.name} -> The client doesn't have the permission EMBED_LINKS to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`
							);
						}
					} else {
						// Send the Message
						(channel as TextChannel).send(msg).catch(console.error);
					}
				} else {
					console.log(
						`${description.name} -> The client doesn't have the permission to send public message to the configured channel "${channelname}" on server "${guild.name}" (${guild.id})`
					);
				}
			} else {
				console.log(`${description.name} -> The channel "${channelname}" do not exist on server "${guild.name}" (${guild.id})`);
			}
		}
	}
}

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	run(client: Client) {
		// Some Auditlog
		AuditLog(client, {
			"640790707082231834": {
				//ppw
				auditlog: "mod-log",
				auditmsg: "mod-log",
			},
			"913987561922396190": {
				// ole
				auditlog: "moderator-only",
				auditmsg: "moderator-only",
			},
		});
	}
};
