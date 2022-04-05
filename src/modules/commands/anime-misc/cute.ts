import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { randomPuppy } from "../../../utils";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("cute", {
			categories: "anime-misc",
			info: "Sends cute anime girls from reddit",
			usage: `\`${prefix}cute\``,
			guildOnly: false,
		});
	}
	async run(message: Message, args: string[]) {
		const msg = await message.channel.send(`Loading...`);

		const subReddits = [
			"kemonomimi",
			"Joshi_Kosei",
			"gao",
			"awwnime",
			"awenime",
			"animeponytails",
			"cutelittlefangs",
			"animewallpaper",
			"fantasymoe",
			"streetmoe",
			"Touhouart",
			"animeburgers",
		];
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
