import { Client, MessageEmbed, TextChannel } from "discord.js";
import { BotEvent } from "../../../handler";
import { find_DB_Return, insert_DB_One } from "../../../utils";
import { private_Events_Info } from "../../../config.json";

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	// spotlight a message from a guild in any channel
	run(client: Client) {
		const guild_ID = private_Events_Info.personalServer.id,
			highlightChannel = private_Events_Info.personalServer.channel_highlight;

		// get guild by id
		const guild = client.guilds.cache.get(guild_ID);
		if (!guild) return console.log("Invalid guild for message spotlight");

		// get channel by id
		const channel = guild.channels.cache.get(highlightChannel) as TextChannel;
		if (!channel) return console.log("Invalid channel for message spotlight");

		client.on("messageReactionAdd", async (reaction, user) => {
			try {
				// make sure it is in guild
				if (!reaction.message.guild) return;

				// make sure it is in the same guild
				if (reaction.message.guild.id !== guild.id) return;

				let count = 0;
				const msg = await reaction.message.channel.messages.fetch(reaction.message.id);
				// make sure user is not bot
				if (user.bot || msg.author.bot) return;

				// make sure reaction is not in news channel or dm also make sure raction is not in same channel as highlightChannel
				if (reaction.message.channel.type === "GUILD_NEWS" || reaction.message.channel.type === "DM" || reaction.message.channel === channel) return;

				reaction.message.reactions.cache.map(async (reaction) => {
					count = count + reaction.count!;
				});

				// if reactions >= 3, send it to the highlightChannel
				if (count >= 3) {
					var data = {
						guildID: guild_ID,
						channelID: reaction.message.channel.id,
						messageID: reaction.message.id,
					};

					var db_Data = await find_DB_Return("spotlighted_message", data);
					// if already in db, return
					if (db_Data.length > 0) return;

					// insert to db
					insert_DB_One("spotlighted_message", data);

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
						.setFooter({ text: `Starred` })
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
				}
			} catch (e) {
				console.log(`[${new Date().toLocaleString()}]`);
				console.log(e);
				channel.send(`**Error**\n${e}`);
			}
		});

		console.log(`Module: Message Spotlight Module Loaded | Guild: ${guild.name}`);
	}
};
