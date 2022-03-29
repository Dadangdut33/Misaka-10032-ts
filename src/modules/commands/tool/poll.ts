import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
const pollEmbed = require("discord.js-poll-embed");

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("poll", {
			categories: "tool",
			info: "Create poll. Please not that it's not recommended to create a long poll because the bot often resets itself so it's not always on 24/7 which means the collector won't work after reset. You can still see the poll results based on the emojis tho...\n**Tips**\n1 hour = 3600 seconds\n\n**Poll limit is 10 options**",
			usage: `\`${prefix}command <timeout> <[title]> <[options 1]> <[options 2]> ... <[options x]>\`\n**Notes:**\n Notice the -> [].\nIf you want the poll to have infinite time, input 0 in timeout`,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		let regex = /\[(.*?)\]/g; // Regex to find options in square bracket []
		let options = args.join(" ").match(regex)!; // Match the regex put it into options

		// If number invalid
		if (parseInt(args[0]) > 2147483647 || isNaN(parseInt(args[0])))
			return message.channel.send({
				embed: {
					color: 0xff0000,
					description: "Invalid timeout duration, please enter a valid number",
				},
			});

		if (!options[1])
			return message.channel.send({
				embed: {
					color: 0xff0000,
					description: "Please enter at least 2 options",
				},
			});

		if (options.length > 10)
			return message.channel.send({
				embed: {
					color: 0xff0000,
					description: "Poll limit is 10 options",
				},
			});

		// Remove the [] surrounding the options
		for (let i = 0; i < options.length; i++) {
			options[i] = options[i].replace(/[\[\]]/g, "");
		}

		// Title if first array of options
		let title = options[0];

		// Timeout on first args
		let timeout = args[0];

		// Remove first array of options which is the title
		options.shift();

		const emojiList = [
			// This contains emoji from 1-10
			"\u0031\u20E3",
			"\u0032\u20E3",
			"\u0033\u20E3",
			"\u0034\u20E3",
			"\u0035\u20E3",
			"\u0036\u20E3",
			"\u0037\u20E3",
			"\u0038\u20E3",
			"\u0039\u20E3",
			"\uD83D\uDD1F",
		];

		const forceEndPollEmoji = "\u2705"; // This is check mark emoji

		// Call the pollembed function
		pollEmbed(message, title, options, timeout, emojiList, forceEndPollEmoji).catch((error: any) => {
			// Catch error if there is any error
			console.log(error);

			return message.channel.send({
				embed: {
					color: 0xff0000,
					title: "An error occured",
					description: error,
				},
			});
		});
	}
};
