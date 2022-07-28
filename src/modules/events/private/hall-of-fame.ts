import { Client, MessageEmbed, TextChannel } from "discord.js";
import { BotEvent } from "../../../handler";
import { find_DB_Return, insert_collection } from "../../../utils";
import { private_Events_Info } from "../../../config.json";

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	run(client: Client) {
		const guild_ID = private_Events_Info.oleServer.id,
			channelToWatch = private_Events_Info.oleServer.multiChannelToWatch,
			hallOfFame = private_Events_Info.oleServer.channel_highlight;

		const guild = client.guilds.cache.get(guild_ID);
		if (!guild) return console.log("Invalid guild for message spotlight");

		// get channel by id
		const channel = guild.channels.cache.get(hallOfFame) as TextChannel;
		if (!channel) return console.log("Invalid channel for message spotlight");

		// listener for a channel message
		client.on("messageCreate", async (message) => {
			try {
				if (!channelToWatch.includes(message.channel.id)) return;
				if (message.author.bot) return;

				let imgExist = true;
				// check if message has an image
				if (message.attachments.size === 0) imgExist = false;

				// check if message has a link
				// a video/img as a link will be shown as embed
				if (message.embeds.length > 0) imgExist = true;

				if (imgExist) {
					// add a reaction to the message
					message.react("👍");
					message.react("👎");
				}
			} catch (e) {
				console.log(`[${new Date().toLocaleString()}]`);
				console.log(e);
			}
		});

		client.on("messageReactionAdd", async (reaction, user) => {
			try {
				// make sure it is in the correct channel
				if (!channelToWatch.includes(reaction.message.channel.id)) return;

				// get the msg and reactor object
				const msg = await reaction.message.channel.messages.fetch(reaction.message.id);
				const reactor = await msg.guild!.members.fetch(user.id);

				// make sure user is not bot
				if (user.bot || msg.author.bot) return;

				// make sure it is in the same guild
				if (reaction.message.guild!.id !== guild.id) return;

				// make sure user is admin
				if (!reactor.permissions.has("ADMINISTRATOR")) return;

				// check reaction content
				if (!reaction.emoji.name!.includes("SETUJUBANH")) return;

				// -------------------------------------
				// make sure it's not a dupe or already in the DB
				const data = {
					guildID: guild_ID,
					channelID: reaction.message.channel.id,
					messageID: reaction.message.id,
				};

				const db_Data = await find_DB_Return("hall_of_fame", data);
				if (db_Data.length > 0) return; // if already in db, return

				// insert to db if not already in db
				insert_collection("hall_of_fame", data);

				// -------------------------------------
				// random footer
				const footerChoice = ["💎", "Worthy", "El caliente", "⭐⭐⭐⭐⭐", "Keren abangnya", "😂👆", "😂👆", "Awesome", "Fantastic", "Pengememe handal"];

				// verify attachment
				let attachment = msg.attachments.size > 0 ? msg.attachments.first()!.url : ""; // if an attachment (ANY)
				if (attachment === "") if (msg.embeds.length > 0) if (msg.embeds[0].type === "image") attachment = msg.embeds[0].url!; // if embedded link (IMAGE)

				const embed = new MessageEmbed()
					.setColor("YELLOW")
					.setAuthor({
						name: msg.author.username,
						iconURL: msg.author.displayAvatarURL({ format: "png", size: 2048 }),
						url: `https://discord.com/channels/${guild_ID}/${reaction.message.channel.id}/${reaction.message.id}`,
					})
					.setDescription(msg ? msg.toString() : "-")
					.setImage(attachment)
					.addField(`Source`, `[Jump](https://discord.com/channels/${guild_ID}/${reaction.message.channel.id}/${reaction.message.id})`)
					.setFooter({ text: footerChoice[Math.floor(Math.random() * footerChoice.length)] })
					.setTimestamp();

				// add attachment link if exist
				if (attachment !== "") embed.addField(`Attachment`, `[Link](${attachment})`);

				// send the message 🚀
				channel.send({ content: `<#${reaction.message.channel.id}>`, embeds: [embed] });

				// -------------------------------------
				// check if attachment is a video
				// if a video then send it separately 🚀
				if (attachment.includes(".mp4")) channel.send(attachment);

				// if a video but embedded because it is a link 🚀
				if (msg.embeds.length > 0) if (msg.embeds[0].video) channel.send(msg.embeds[0].video.url!);
			} catch (e) {
				console.log(`[${new Date().toLocaleString()}] [ERROR] [hall-of-fame]`);
				console.log(e);
			}
		});

		console.log(`Module: Hall of Fame Module Loaded | Guild: ${guild.name}`);
	}
};
