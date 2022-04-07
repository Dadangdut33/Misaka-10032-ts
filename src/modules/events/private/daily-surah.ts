import { Client, MessageEmbed, TextChannel } from "discord.js";
import { BotEvent } from "../../../handler";
import { private_Events_Info } from "../../../config.json";
import moment from "moment-timezone";
import adhan from "adhan";
import axios from "axios";
const cron = require("cron");

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	async run(client: Client) {
		const guildID = private_Events_Info.personalServer.id,
			channelID = private_Events_Info.personalServer.channel_dailySurah;

		const guild = client.guilds.cache.get(guildID);
		if (!guild) return console.log("Invalid guild for daily surah");

		let channel = guild.channels.cache.get(channelID) as TextChannel;
		if (!channel) return console.log("Invalid channel for daily surah");

		try {
			let scheduledMessage = new cron.CronJob(
				"30 07 * * *",
				async () => {
					// This runs every day at 07:30:00, you can do anything you want
					const { data } = await axios.get(`https://api.banghasan.com/quran/format/json/acak`);

					let embedAyat = new MessageEmbed()
						.setAuthor({ name: `Random Ayat of the day` })
						.setTitle(`Q.S. ${data.surat.nama}: ${data.surat.nomor} ${data.surat.asma} (${data.acak.id.ayat})`)
						.setDescription(`${data.acak.ar.teks}\n\n**Terjemahan**: \n${data.acak.id.teks}`)
						.addField(
							`Read Full Surah`,
							`[[Kalam.sindonews]](https://kalam.sindonews.com/surah/${data.surat.nomor}#ayat-${data.acak.id.ayat}) | [[quran.kemenag]](https://quran.kemenag.go.id/sura/${data.surat.nomor})`,
							true
						)
						.addField(`Ayat Interpretation (Tafsir)`, `[[Kalam.sindonews]](https://kalam.sindonews.com/ayat/${data.acak.id.ayat}/${data.surat.nomor})`, true)
						.setColor("RANDOM");

					let apiError = false;
					if (data.status == "error") {
						apiError = true;
						console.log(`[${moment().tz("Asia/Jakrta").format("DD/MM/YYYY HH:mm:ss")}] [ERROR] [daily-surah] API error:\n${data.pesan}`);
					}

					// Default for local time
					let coordinates = new adhan.Coordinates(-6.175322129297112, 106.82800210012158);

					//Set Up Data
					let date = new Date(); // Date UTC + 0
					let params = adhan.CalculationMethod.MuslimWorldLeague();
					params.madhab = adhan.Madhab.Shafi;
					let prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

					//Get Praytime
					let fajrTime = moment(prayerTimes.fajr).tz("Asia/Jakarta").format("h:mm A"),
						sunriseTime = moment(prayerTimes.sunrise).tz("Asia/Jakarta").format("h:mm A"),
						dhuhrTime = moment(prayerTimes.dhuhr).tz("Asia/Jakarta").format("h:mm A"),
						asrTime = moment(prayerTimes.asr).tz("Asia/Jakarta").format("h:mm A"),
						maghribTime = moment(prayerTimes.maghrib).tz("Asia/Jakarta").format("h:mm A"),
						ishaTime = moment(prayerTimes.isha).tz("Asia/Jakarta").format("h:mm A"),
						shownDate = moment.tz("Asia/Jakarta").format("dddd DD MMMM YYYY"),
						time = moment.tz("Asia/Jakarta").format("HH:mm:ss");

					//Send Result
					let embedPray = new MessageEmbed()
						.setColor("RANDOM")
						.setTitle(`Daily Praytime for ${shownDate} - Asia/Jakarta`)
						.addField(`Below are the praytime for today`, "Current Time: `" + time + "`")
						.addFields(
							{ name: "Fajr", value: `${fajrTime}`, inline: true },
							{ name: "Sunrise", value: `${sunriseTime}`, inline: true },
							{ name: "Dhuhr", value: `${dhuhrTime}`, inline: true },
							{ name: "Asr", value: `${asrTime}`, inline: true },
							{ name: "Maghrib", value: `${maghribTime}`, inline: true },
							{ name: "Isha", value: `${ishaTime}`, inline: true }
						)
						.setFooter({ text: `Asia/Jakarta (+7)` });

					channel.send({ embeds: [embedPray] });
					if (!apiError) channel.send({ embeds: [embedAyat] });
				},
				null,
				true,
				"Asia/Jakarta"
			);

			// When you want to start it, use:
			scheduledMessage.start();

			console.log(`Module: Daily-Surah Loaded | Loaded from local module`);
		} catch (e) {
			console.log(`[${moment().tz("Asia/Jakrta").format("DD/MM/YYYY HH:mm:ss")}] [ERROR] [daily-surah] ${e}`);
		}
	}
};
