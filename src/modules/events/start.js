const { BotEvent } = require("../../handler");
const { prefix } = require("../../config.json");
const Moment = require("moment-timezone");
// public
const activityRand = require("./types/public/bot-activity");
const listenToMessage = require("./types/public/msgListener");

// personal private server
const Auditlog = require("./private/audit");

// slashes
const slashCommands = require("./types/slash-commands/slasher");

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
	}

	run(client) {
		// prettier-ignore
		console.log(
			`Logged in as ${client.user.tag} at ${Moment(client.readyAt).tz("Asia/Jakarta").format("dddd DD MMMM YYYY HH:mm:ss")}\nManaging ${client.guilds.cache.size} Guilds, ${client.channels.cache.size} Channels, and ${client.users.cache.size} Members`
		);

		// Presence at start
		client.user.setPresence({
			status: "online",
			activity: {
				name: `${prefix}help | ${Moment(client.readyAt).tz("Asia/Jakarta").format("HH:mm:ss")} Booting up... Managing ${client.guilds.cache.size} Guilds, ${
					client.channels.cache.size
				} Channels, and ${client.users.cache.size} Members`,
				type: "PLAYING",
			},
		});

		//Bot Activity
		setInterval(() => {
			var x = Math.floor(Math.random() * activityRand().actLen);
			client.user.setActivity({
				type: `${activityRand(x).activity.type}`,
				name: `${prefix}help | ${activityRand(x).activity.desc}`,
			});
		}, 900000); //900000 -> every 15 minutes
		console.log(`${"=".repeat(30)}\nModule: Random Bot activity loaded (${activityRand().actLen}) | Loaded from local modules | Bot's presence will change every 15 minutes.`);

		// register slash commands
		slashCommands(client);

		// events
		const personalGuildID = "640790707082231834",
			vc_label_id = "798031042954919957",
			oleGuildID = "913987561922396190",
			ole_welcome_msg = "913987561922396193";

		// Some Auditlog
		Auditlog(client, {
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

		// Message Listener
		listenToMessage(client); // meme react, haiku, anime, manga, crosspost news
	}
};
