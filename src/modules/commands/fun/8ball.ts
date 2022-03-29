import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

const responses = [
	"it is certain",
	"it is decidedly so",
	"without a doubt",
	"yes — definitely",
	"you may rely on it",
	"as I see it, yes",
	"most likely",
	"outlook good",
	"yes",
	"signs point to yes",
	"reply hazy, try again",
	"ask again later",
	"better not tell you now",
	"cannot predict now",
	"concentrate and ask again",
	"don't count on it",
	"my reply is no",
	"my sources say no",
	"outlook not so good",
	"very doubtful",
	"Menurut buku tatang sutarma jawabannya adalah IYA",
	"Menurut buku tatang sutarma jawabannya adalah Tidak",
	"Iya silakan",
	"Monggo",
	"ora",
	"Jangan",
	"Gasken banh",
	"Mungkin",
	"Tidak",
	"YNTKTS",
];

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("8ball", {
			categories: "fun",
			info: "*The Magic 8 Ball is a toy used for advice gaccha* or at least that's what it's supposed to do, so yeah.",
			usage: `\`${prefix}8ball [...]\``,
			guildOnly: false,
		});
	}

	async run(message: Message, args: string[]) {
		return message.channel.send(`:8ball: | ${responses[Math.random() * responses.length]} **${message.author.toString()}**`);
	}
};
