import { MessageEmbed, Message } from "discord.js";
import moment from "moment-timezone";
import Genius, { Song } from "genius-lyrics";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("lyrics", {
			aliases: ["ly"],
			categories: "music",
			info: "Get lyrics of currently played song or from input. Source from genius.com. Add `[first]` to the first argument to instantly choose the first song.",
			usage: `\`${prefix}command/alias [[first]] [song name]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[], { musicP, addNewPlayer }: { musicP: musicSettingsInterface; addNewPlayer: addNewPlayerArgsInterface }) {
		let embed = new MessageEmbed().setDescription("Looking For Lyrics ...").setColor("YELLOW");

		const guild = message.guild!;
		// get player
		let playerObj = musicP.get(guild.id)!;
		if (!playerObj) {
			addNewPlayer(guild, musicP, message.client);
			playerObj = musicP.get(guild.id)!;
		}

		if (!args.length && playerObj.player.state.status !== "playing") return message.reply({ content: "Please Type In The Song Name", allowedMentions: { repliedUser: false } });

		const msg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
		try {
			const Client = new Genius.Client(process.env.Genius_Key);
			let chosen: Song,
				lyrics: string,
				num: number,
				query = "",
				first = false;

			if (args.length > 0 && args[0].toLowerCase() === "[first]") {
				first = true;
				args.shift();
			}

			query = args.length > 0 ? args.join(" ") : playerObj.query; // querry
			const songs = await Client.songs.search(query); // search

			// no lyrics found
			if (songs.length === 0) return msg.edit({ embeds: [new MessageEmbed().setDescription("No Lyrics Found").setColor("RED")] });

			// if first is true, then choose the first song
			if (first) {
				chosen = songs[0];
				lyrics = await chosen.lyrics();
			}
			// ask user to pick songs
			else if (songs.length > 1) {
				const embed = new MessageEmbed()
					.setTitle("Multiple Songs Found")
					.setDescription(
						songs
							.slice(0, 20)
							.map((song, index) => `\`${index + 1}.\` **${song.title}** - ${song.url}`)
							.join("\n")
					)
					.setColor("YELLOW")
					.setFooter({ text: "Type the number of the song title to see its lyrics. Type 'cancel' to cancel." });
				msg.edit({ embeds: [embed] });

				try {
					const m = await message.channel.awaitMessages({ filter: (m: Message) => m.author.id === message.author.id, max: 1, time: 30000, errors: ["time"] });
					if (!m.first()) return message.reply({ content: "⛔ **Cancelled because input not provided by user!**", allowedMentions: { repliedUser: false } });
					num = parseInt(m.first()!.content);
					if (isNaN(num)) {
						if (m.first()!.content.toLowerCase().includes("cancel")) {
							msg.delete(); // delete only if user cancel
							m.first()!.delete();
						}

						return message.reply({
							content: m.first()!.content.toLowerCase().includes("cancel") ? "**Cancelled by user!**" : "⛔ **Incorrect input!**",
							allowedMentions: { repliedUser: false },
						}); // not a number
					}
					if (num > songs.length || num < 1) return message.reply({ content: "⛔ **Incorrect input!**", allowedMentions: { repliedUser: false } }); // out of range
					m.first()!.delete(); // delete user message
				} catch (error) {
					msg.delete();
					return message.reply({ content: `⛔ **Cancelled because input not provided by user!**\n`, allowedMentions: { repliedUser: false } });
				}

				chosen = songs[num - 1];
				lyrics = await chosen.lyrics();
			} else {
				// ask confirmation to user
				const embed = new MessageEmbed()
					.setTitle("Song Lyrics Found")
					.setDescription(`Found **[${songs[0].title}]${songs[0].url}**. Is this the song you want?`)
					.setColor("YELLOW")
					.setFooter({ text: "Type 'yes' to confirm. Type 'no' to cancel/deny." });
				msg.edit({ embeds: [embed] });

				try {
					const m = await message.channel.awaitMessages({ filter: (m: Message) => m.author.id === message.author.id, max: 1, time: 30000, errors: ["time"] });
					if (!m.first()) return message.reply({ content: "⛔ **Cancelled because input not provided by user!**", allowedMentions: { repliedUser: false } });
					if (m.first()!.content.toLowerCase().includes("no")) {
						msg.delete(); // delete only if user cancel
						m.first()!.delete();
						return message.reply({ content: "👌 **Cancelled by user!**", allowedMentions: { repliedUser: false } });
					} else if (m.first()!.content.toLowerCase().includes("yes")) {
						m.first()!.delete();
					} else {
						return message.reply({ content: "⛔ **Incorrect input!**", allowedMentions: { repliedUser: false } });
					}
				} catch (error) {
					msg.delete();
					return message.reply({ content: `⛔ **Cancelled because input not provided by user!**\n`, allowedMentions: { repliedUser: false } });
				}

				chosen = songs[0];
				lyrics = await chosen.lyrics();
			}

			// lyrics empty
			if (lyrics.length == 0) {
				msg.delete();
				let embed = new MessageEmbed().setTitle(`Something went Wrong!`).setDescription(`Lyrics won't load, please try again!`);

				return message.channel.send({ embeds: [embed] });
			}

			const edited = new MessageEmbed().setTitle(chosen.title).setURL(chosen.url).setImage(chosen.image).setColor("YELLOW");
			const fetched = await chosen.fetch();
			if (fetched.releasedAt) {
				let dateGet = moment(fetched.releasedAt).tz("Asia/Jakarta").format("DD-MMMM-YYYY");

				edited.addField(`Lyrics State`, chosen.raw.lyrics_state, true);
				edited.addField(`Released at`, `${dateGet}`, true);
			}

			msg.edit({ embeds: [edited] });
			let start = 0,
				end = 2048;
			for (let i = 0; i < Math.ceil(lyrics.length / 2048); i++) {
				const embed = new MessageEmbed().setColor("BLUE").setDescription(lyrics.slice(start, end));

				start += 2048;
				end += 2048;
				message.channel.send({ embeds: [embed] });
			}
		} catch (e) {
			embed.setDescription("Err : " + e);
			msg.edit({ embeds: [embed] });
		}
	}
};
