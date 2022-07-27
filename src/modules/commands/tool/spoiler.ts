import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("spoiler", {
			aliases: ["s"],
			categories: "tool",
			info: "Gives spoiler warning by reminding people that the text above is full of spoiler of a certain series",
			usage: `\`${prefix}spoiler/alias [title]\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		const embed = new MessageEmbed()
			.setColor("RANDOM")
			.setFooter({ text: args.length > 0 ? `${args.join(" ")} Spoiler Above!!` : message.author.username })
			.setTitle(`SPOILER WARNING!!${args.length > 0 ? `\`${args.join(" ")}\`` : ``} SPOILER ABOVE!!`)
			.setThumbnail("https://cdn.discordapp.com/attachments/653206818759376916/700992854763372584/Misaka_10777.jpg")
			.setDescription(
				"A spoiler is an element of a disseminated summary or description of any piece of fiction that reveals any plot elements which threaten to give away important details. Typically, the details of the conclusion of the plot, including the climax and ending, are especially regarded as spoiler material. It can also be used to refer to any piece of information regarding any part of a given media that a potential consumer would not want to know beforehand. Because enjoyment of fiction depends a great deal upon the suspense of revealing plot details through standard narrative progression, the prior revelation of how things will turn out can ''spoil'' the enjoyment that some consumers of the narrative would otherwise have experienced. -wikipedia.org"
			)
			.addFields({
				name: "Spoiler (Bahasa Indonesia: Beberan)",
				value:
					"Adalah tulisan atau keterangan mengenai suatu cerita, yang membeberkan jalan cerita tersebut. Membaca beberan dari suatu cerita dapat menyebabkan berkurangnya kesenangan membaca cerita itu, karena kesenangan membaca sebuah cerita biasanya tergantung kepada dramatisasi atau ketegangan yang ditimbulkan oleh cerita tersebut. Biasanya dalam media massa maupun Internet, beberan disembunyikan dengan cara tertentu, sehingga hanya terbaca oleh yang ingin melihat beberan tersebut. -wikipedia.org",
			})
			.setImage("https://cdn.discordapp.com/attachments/651015913080094724/700999319326556171/1456118167-bcaf5c2f41b07564f965bfb17b16a0e2.png")
			.setTimestamp();

		return message.channel.send({
			content: `Thanks ${message.author} \n\n\n**${args.length > 0 ? `\`${args.join(" ")}\` ` : ``}SPOILER** ABOVE!!!\n\n\nScroll up at your own risk`,
			embeds: [embed],
		});
	}
};
