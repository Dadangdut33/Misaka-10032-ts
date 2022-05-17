import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("ping", {
			categories: "info-bot",
			info: "Get the ping of the bot",
			usage: `\`${prefix}ping or ${prefix}alias\``,
			guildOnly: false,
		});
	}

	async run(message: Message) {
		const msg = await message.channel.send("🏓 Pinging...");
		const ping = Math.round(msg.createdTimestamp - message.createdTimestamp);

		if (ping <= 0) {
			return msg.edit("Please try again...");
		}

		return msg.edit(`🏓 Pong\n>>> Latency is ${Math.floor(msg.createdAt.getTime() - message.createdAt.getTime())}ms\nAPI Latency is ${Math.round(message.client.ws.ping)}ms`);
	}
};
