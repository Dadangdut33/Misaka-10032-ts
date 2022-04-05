import { Client } from "discord.js";
import { BotEvent } from "../../handler";
import { prefix } from "../../config.json";
import { activity } from "./global/bot-activity";
import moment from "moment-timezone";

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
	}

	run(client: Client) {
		console.log("=".repeat(70));
		console.log(`Logged in as ${client.user!.tag} at ${moment(client.readyAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")}`);
		console.log(`Managing ${client.guilds.cache.size} Guilds, ${client.channels.cache.size} Channels, and ${client.users.cache.size} Members`);

		// Presence at start
		client.user!.setPresence({
			status: "online",
			activity: {
				name: `${prefix}help | ${moment(client.readyAt).tz("Asia/Jakarta").format("HH:mm:ss")} Booting up... Managing ${client.guilds.cache.size} Guilds, ${
					client.channels.cache.size
				} Channels, and ${client.users.cache.size} Members`,
				type: "PLAYING",
			},
		});

		//Bot Activity
		setInterval(() => {
			client.user!.setActivity({
				type: activity[Math.floor(Math.random() * activity.length)].type,
				name: `${prefix}help | ${activity[Math.floor(Math.random() * activity.length)].desc}`,
			});
		}, 900000); //900000 -> every 15 minutes
		console.log(`Activity will change every 15 minutes with ${activity.length} varieties`);
	}
};
