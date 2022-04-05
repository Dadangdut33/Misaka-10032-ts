import { Client } from "discord.js";
import { BotEvent } from "../../../../handler";
import { prefix } from "../../../../config.json";

module.exports = class extends BotEvent {
	constructor() {
		super("ready");
		// this.disable();
	}

	run(client: Client) {
		// loop through all guilds
		client.guilds.cache.forEach((guild) => {
			// register slash command
			// @ts-ignore
			// prettier-ignore
			client.api.applications(client.user!.id).guilds(guild.id)
				.commands.post({
					data: {
						name: "prefix",
						description: "Get bot prefix",
					}, 
				});

			// @ts-ignore
			// prettier-ignore
			client.api.applications(client.user!.id).guilds(guild.id)
				.commands.post({
					data: {
						name: "ping",
						description: "Get bot ping",
					}, 
				});
		});

		// @ts-ignore
		client.ws.on("INTERACTION_CREATE", async (interaction) => {
			const command = interaction.data.name.toLowerCase();

			if (command === "prefix") {
				// @ts-ignore
				client.api.interactions(interaction.id, interaction.token).callback.post({
					data: {
						type: 4,
						data: {
							content: `Bot prefix is \`${prefix}\``,
						},
					},
				});
			}

			if (command === "ping") {
				// @ts-ignore
				client.api.interactions(interaction.id, interaction.token).callback.post({
					data: {
						type: 4,
						data: {
							content: `API latency is \`${client.ws.ping}\``,
						},
					},
				});
			}
		});

		console.log("Module: Slash Commands Module Loaded");
	}
};
