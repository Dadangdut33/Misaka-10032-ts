import { MessageEmbed, Message } from "discord.js";
import { Command } from "../../../handler";
import { prefix } from "../../../config.json";
import { promptMessage } from "../../../local_lib/functions";
const chooseArr = ["🗻", "✂", "📰"];

function getResult(me: string, clientChosen: string) {
	if ((me === "🗻" && clientChosen === "✂") || (me === "📰" && clientChosen === "🗻") || (me === "✂" && clientChosen === "📰")) {
		return "You won!";
	} else if (me === clientChosen) {
		return "It's a tie!";
	} else {
		return "You lost!";
	}
}

module.exports = class extends Command {
	constructor() {
		super("rps", {
			categories: "fun",
			info: "Rock Paper Scissors game. React to one of the emojis to play the game",
			usage: `\`${prefix}rps\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		const embed = new MessageEmbed()
			.setColor("RANDOM")
			.setFooter(message.author.username, message.author.displayAvatarURL())
			.setDescription("Add a reaction to one of these emojis to play the game!");

		const chooseEmojiMsg = await message.channel.send(embed); // Send embed in await
		const reacted = await promptMessage(chooseEmojiMsg, message.author, 50, chooseArr); // Get emojis reaction
		const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)]; // Get bot reaction
		const result = getResult(reacted, botChoice); // Get result from emojis and bot
		await chooseEmojiMsg.reactions.removeAll(); // Remove emotes

		if (!reacted) {
			// If no reaction after timeout
			embed.setTitle(`Game Aborted!`).setDescription(`User did not choose any emojis, so the game is aborted`);

			chooseEmojiMsg.edit(embed);
			return; // return it so it ends
		} // If reaction, then pass

		embed.setDescription("").addField(result, `${reacted} vs ${botChoice}`);

		chooseEmojiMsg.edit(embed);
	}
};
