import { MessageEmbed, Message } from "discord.js";
import moment from "moment-timezone";
import prettyMilliseconds from "pretty-ms";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("profile", {
			aliases: ["info"],
			categories: "info-server",
			info: "Shows yours or tagged user information (Join date, ID, Avatar, & Roles)",
			usage: `\`${prefix}command/alias [tagged user]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let embed = new MessageEmbed();
		let roles: string[] = [];
		if (!message.mentions.users.first()) {
			message.member!.roles.cache.forEach((role) => {
				roles.push(`\`${role.name}\``);
			});

			let state = "-",
				name = "-",
				type = "-";
			if (message.author.presence.activities[0] !== undefined) {
				if (message.author.presence.activities[0].name !== null) {
					state = `${message.author.presence.activities[0].emoji ? `${message.author.presence.activities[0].emoji} ` : ""}${
						message.author.presence.activities[0].state ? message.author.presence.activities[0].state : "-"
					}`;
					name = message.author.presence.activities[0].name;
					type = message.author.presence.activities[0].type;
				}
			}

			// calc age
			let today = moment().tz("Asia/Jakarta");
			let age = today.valueOf() - message.author.createdAt.getTime();

			//Embed
			embed.setTitle(`Your Profile! (${message.author.tag})`);
			embed.setThumbnail(message.author.displayAvatarURL({ format: "jpg", size: 2048 }));
			embed.setColor(`RANDOM`);
			embed.addField(`Server Joined at`, `${moment(message.member!.joinedAt).tz("Asia/Jakarta").format("DD/MM/YYYY .(HH:mm:ss)").replace(`.`, `\n`)}`, true);
			embed.addField(`ID`, `${message.author.id}`, true);
			embed.addField(`User Status`, `${message.author.presence.status}`, true);
			embed.addField(`Activity Name`, `${name}`, true);
			embed.addField(`Activity Type`, `${type}`, true);
			embed.addField(`Activity State`, `${state}`, true);
			embed.addField(`Account Age`, `${prettyMilliseconds(age)}`, false);
			embed.addField(`Account Created At`, `${moment(message.author.createdAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700 (Western Indonesia Time)`, false);
			embed.addField(`Roles`, `${roles.join(` `)}`);
			embed.addField(
				`Avatar URL`,
				`[JPG](${message.author.displayAvatarURL({ format: "jpg", size: 2048 })}) | [PNG](${message.author.displayAvatarURL({
					format: "png",
					size: 2048,
				})}) | [WEBP](${message.author.displayAvatarURL({
					format: "webp",
					size: 2048,
				})})`
			);
			embed.setFooter(`${message.author.username}'s Profile`);
			embed.setTimestamp();

			return message.channel.send(embed);
		} else {
			let User = message.mentions.members!.first();
			User!.roles.cache.forEach((role) => {
				roles.push(`\`${role.name}\``);
			});

			let state = "-",
				name = "-",
				type = "-";
			if (User!.presence.activities[0] !== undefined) {
				if (User!.presence.activities[0].name !== null) {
					state = `${User!.presence.activities[0].emoji ? `${User!.presence.activities[0].emoji} ` : ""}${
						User!.presence.activities[0].state ? User!.presence.activities[0].state : "-"
					}`;
					name = User!.presence.activities[0].name;
					type = User!.presence.activities[0].type;
					if (state === null) {
						state = "-";
					}
				}
			}

			// calc age
			let today = moment().tz("Asia/Jakarta");
			let age = today.valueOf() - message.client.users.cache.get(User!.id)!.createdAt.getTime();

			//Embed
			embed.setTitle(`${User!.user.tag}'s Profile!`);
			embed.setThumbnail(User!.user.displayAvatarURL({ format: "png", size: 2048 }));
			embed.setColor(`RANDOM`);
			embed.addField(`Nickname`, User!.nickname ? User!.nickname : `-`, false);
			embed.addField(`Server Joined at`, `${moment(User!.joinedAt).tz("Asia/Jakarta").format("DD/MM/YYYY .(HH:mm:ss)").replace(`.`, `\n`)}`, true);
			embed.addField(`ID`, `${User!.id}`, true);
			embed.addField(`User Status`, `${User!.presence.status}`, true);
			embed.addField(`Activity Name`, `${name}`, true);
			embed.addField(`Activity Type`, `${type}`, true);
			embed.addField(`Activity State`, `${state}`, true);
			embed.addField(`Account Age`, `${prettyMilliseconds(age)}`, false);
			embed.addField(`Account Created At`, `${moment(User!.user.createdAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")} GMT+0700 (Western Indonesia Time)`, false);
			embed.addField(`Roles`, `${roles.join(` `)}`);
			embed.addField(
				`Avatar URL`,
				`[JPG](${User!.user.displayAvatarURL({ format: "jpg", size: 2048 })}) | [PNG](${User!.user.displayAvatarURL({
					format: "png",
					size: 2048,
				})}) | [WEBP](${User!.user.displayAvatarURL({
					format: "webp",
					size: 2048,
				})})`
			);
			embed.setFooter(`Requested by ${message.author.username}`);

			return message.channel.send(embed);
		}
	}
};
