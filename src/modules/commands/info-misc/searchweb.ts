import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("searchweb", {
			aliases: ["sw"],
			categories: "info-misc",
			info: "Search for stuff using duckduckgo and return the results as link",
			usage: `\`${prefix}command/alias <...>\``,
			guildOnly: false,
		});
		this.disable();
	}
	async run(message: Message, args: string[]) {
		return message.channel.send("Disabled because of package size");

		// 	if (args.length < 1) return message.channel.send(`Please input correctly!`);

		// 	const msg = await message.channel.send(`**Searching...**`),
		// 		timeMsStart = Date.now(),
		// 		options = {
		// 			agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
		// 		};

		// 	const result = await sec.duckduckgo(args.join(" "), options);

		// 	if (result.error) return msg.edit(`Error: ${result.msg}`);
		// 	if (result.links.length === 0) return msg.edit(`**No result found!**`);
		// 	msg.edit("**Finishes search!** Found " + result.links.length + " results! Time taken " + (Date.now() - timeMsStart) + "ms");

		// 	let embed = new MessageEmbed()
		// 		.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
		// 		.setTitle(`Web Search`)
		// 		.setDescription(`Query: ${args.join(" ")}\n\n**Found ${result.links.length} results!**`)
		// 		.setColor("#e37151")
		// 		.setFooter({ text: `Via Duckduckgo` });

		// 	// limit to 25 results
		// 	let limit = result.links.length > 25 ? 25 : result.links.length;
		// 	for (let i = 0; i < limit; i++) {
		// 		// get title after the 2 //
		// 		let titleSplit = result.links[i].split("/");
		// 		let title = titleSplit.slice(2, titleSplit.length).join("/");

		// 		let toShow = `[${title}](${result.links[i]})`;
		// 		if (title === "") toShow = `${result.links[i]}`;

		// 		embed.addField((i + 1).toString(), toShow, true);
		// 	}

		// 	return message.channel.send({ embeds: [embed] });
		// }
	}
};
