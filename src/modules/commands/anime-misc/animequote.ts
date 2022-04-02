import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import animeQuotes from "animequotes";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("animequote", {
			categories: "anime-misc",
			aliases: ["aq"],
			info: "Get random quote from anime. ",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		const dataGet = animeQuotes.randomQuote();
		if (!dataGet.success) return message.channel.send("Error: Fail to get data");

		return message.channel.send({
			embed: {
				color: "RANDOM",
				title: `${dataGet.quote}`,
				description: `${dataGet.name} - ${dataGet.anime}`,
			},
		});
	}
};
