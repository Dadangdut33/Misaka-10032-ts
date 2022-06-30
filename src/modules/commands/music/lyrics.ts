import { MessageEmbed, Message } from "discord.js";
import moment from "moment-timezone";
import Genius from "genius-lyrics";
import { Command, handlerLoadOptionsInterface, musicSettingsInterface, addNewPlayerArgsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("lyrics", {
			aliases: ["ly"],
			categories: "music",
			info: "Get lyrics of currently played song or from input. Source from genius.com",
			usage: `\`${prefix}command/alias [song name]\``,
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

		if (!args.length && playerObj.player.state.status !== "playing") return message.channel.send("Please Type In The Song Name");

		const msg = await message.channel.send({ embeds: [embed] });
		try {
			const Client = new Genius.Client(process.env.Genius_Key);
			const songs = await Client.songs.search(args.length > 0 ? args.join(" ") : playerObj.currentTitle);
			const lyrics = await songs[0].lyrics();

			if (lyrics.length == 0) {
				msg.delete();
				let embed = new MessageEmbed().setTitle(`Something went Wrong!`).setDescription(`Lyrics won't load, please try again!`);

				return message.channel.send({ embeds: [embed] });
			}

			const edited = new MessageEmbed()
				.setTitle(songs[0].title)
				.setURL(songs[0].url)
				.addField(`Lyrics State`, songs[0].raw.lyrics_state, true)
				.setImage(songs[0].image)
				.setColor("YELLOW");

			const fetched = await songs[0].fetch();
			if (fetched.releasedAt) {
				var dateGet = moment(fetched.releasedAt).tz("Asia/Jakarta").format("DD-MMMM-YYYY");

				edited.addField(`Released at`, `${dateGet}`, true);
			}

			msg.edit({ embeds: [edited] });
			var start = 0,
				end = 2048;
			for (let i = 0; i < Math.ceil(lyrics.length / 2048); i++) {
				const embed = new MessageEmbed().setColor("BLUE").setDescription(lyrics.slice(start, end));

				start += 2048;
				end += 2048;
				message.channel.send({ embeds: [embed] });
			}
		} catch (e) {
			embed.setDescription("Got err : " + e);
			msg.edit({ embeds: [embed] });
			console.log(e);
		}
	}
};
