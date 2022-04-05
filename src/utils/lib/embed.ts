import { MessageEmbed, DiscordAPIError, Message, User } from "discord.js";

export async function promptMessage(message: Message, author: User, time: number, validReactions: any) {
	// We put in the time as seconds, with this it's being transfered to MS
	time *= 1000;

	// For every emoji in the function parameters, react in the good order.
	for (const reaction of validReactions) await message.react(reaction);

	// Only allow reactions from the author,
	// and the emoji must be in the array we provided.
	const filter = (reaction: any, user: User) => validReactions.includes(reaction.emoji.name) && user.id === author.id;

	// And ofcourse, await the reactions
	return message.awaitReactions(filter, { max: 1, time: time }).then((collected) => collected.first() && collected.first()!.emoji.name);
}

// Paginator scrapped from https://github.com/saanuregh/discord.js-pagination. Modified by me personally
export async function paginationEmbed(msg: Message, pages: MessageEmbed[], emojiList = ["⏪", "⏩", "❌"], timeout = 300000, customFooter = false) {
	try {
		// Try
		if (!msg.channel) throw new Error("Channel is inaccessible.");
		if (!pages) throw new Error("Pages are not given.");
		if (emojiList.length !== 3) emojiList = ["⏪", "⏩", "❌"];
		let page = 0,
			deleted = false,
			curPage: Message;

		if (!customFooter) {
			curPage = await msg.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
		} else {
			curPage = await msg.channel.send(pages[page]);
		}

		for (const emoji of emojiList) await curPage.react(emoji);
		const reactionCollector = curPage.createReactionCollector((reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot && user.id === msg.author.id, {
			time: timeout,
		});
		reactionCollector.on("collect", (reaction) => {
			reaction.users.remove(msg.author);
			switch (reaction.emoji.name) {
				case emojiList[0]:
					page = page > 0 ? --page : pages.length - 1;
					break;
				case emojiList[1]:
					page = page + 1 < pages.length ? ++page : 0;
					break;
				case emojiList[2]:
					curPage.reactions.removeAll(); // Remove Reaction

					pages[page] // Edit Current page make all empty
						.setAuthor(``, ``, ``) // Author, icon, links
						.setTitle(`Embed Viewing Closed by Message Author`) // Title
						.setDescription(`❌ ${msg.author} Closed the embed`) // Desc
						.setURL(``) // Title URL
						.setImage(``) // Image
						.setTimestamp(undefined) // Timestamp
						.setFooter(``, ``) // Footer, icon
						.setThumbnail(``).fields = []; // Thumbnail // Field

					curPage.edit(pages[page]); // Edit it

					deleted = true;

					return; // So it end there, no error
				default:
					break;
			}
			if (!customFooter) curPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
			else curPage.edit(pages[page]);
		});
		reactionCollector.on("end", () => {
			if (!customFooter) {
				if (!deleted) {
					// If curpage is still there
					if (pages[page].footer!.text !== "") {
						// If it's not closed by author
						curPage.reactions.removeAll();

						pages[page].setFooter(`Page ${page + 1} / ${pages.length} | Pages switching removed due to timeout`);

						curPage.edit(pages[page]);
					}
				}
			} else {
				if (!deleted) {
					curPage.reactions.removeAll();
				}
			}
		});
		return curPage;
	} catch (e) {
		console.log(e);
		// Catch error
		if (e instanceof DiscordAPIError) {
			let embed = new MessageEmbed().setTitle("Error").setDescription(`Data is too long to be returned as embed!`).addField(`Details`, e).setColor("#000");

			msg.channel.send(embed);
		} else {
			let embed = new MessageEmbed().setTitle("Error").setDescription(e).setColor("#000");

			msg.channel.send(embed);
		}
	}
}
