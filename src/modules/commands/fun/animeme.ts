import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { randomPuppy } from "../../../utils/functions";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("animeme", {
			categories: "fun",
			info: "Sends a funny anime meme from reddit",
			usage: `\`${prefix}animeme\``,
			guildOnly: false,
		});
	}
	async run(message: Message, args: string[]) {
		const msg = await message.channel.send(`Loading...`);

		const subReddits = ["goodanimemes", "HistoryAnimemes", "Animemes"];
		const random = subReddits[Math.floor(Math.random() * subReddits.length)];

		let succes = true;
		const img = await randomPuppy(random).catch((e) => {
			console.log(e);
			msg.edit(`Can't reached the subreddit, please try again\nDetails: \`\`\`js\n${e}\`\`\``);

			succes = false;
		});

		if (!succes) return; // fail

		msg.delete();
		const embed = new MessageEmbed()
			.setColor("RANDOM")
			.setImage(img)
			.setTitle(`From /r/${random}`)
			.setURL(`https://reddit.com/r/${random}`)
			.setFooter(`Requested by ${message.author.username}`);

		return message.channel.send(embed);
	}
};
