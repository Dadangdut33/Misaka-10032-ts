import { MessageEmbed, Message, TextChannel } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("purge", {
			aliases: ["delete"],
			categories: "moderation",
			info: "Batch delete tagged user's message [Limit 100] and only limited to message up to [14 days], only usable by admin and mods",
			usage: `\`${prefix}command/alias <user> <amount>\``,
			guildOnly: true,
			permission: "MANAGE_MESSAGES",
		});
	}

	async run(message: Message, args: string[]) {
		message.delete();

		if (!args[0]) {
			return message.channel.send("Please tag the profile of the message's sender").then((msg) => setTimeout(() => msg.delete(), 5000));
		}
		// get user
		let user = message.mentions.members!.first();

		//Check User
		if (!user) {
			let embed = new MessageEmbed().setColor("#000000").setDescription(`Invalid user tag!`);

			return message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 5000));
		}

		//Amount
		args.shift();
		const amount = parseInt(args[0]);

		//Check Amount
		if (isNaN(amount) || amount < 1) {
			let embed = new MessageEmbed().setColor("#000000").setDescription(`Please specify a valid amount of message that you want to delete!`);

			return message.channel.send({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 5000));
		}

		message.channel.messages
			.fetch({
				limit: 100,
			})
			.then((messages) => {
				let counter = 0;
				let filteredMsg = messages.filter((m: Message) => {
					if (counter > amount) return false; // slice manually

					counter++;
					return m.author.id === user!.id;
				});

				// cast to textchannel to use bulkDelete
				(message.channel as TextChannel).bulkDelete(filteredMsg).catch(async (error) => {
					if (error) {
						let embed = new MessageEmbed().setColor("#000000").setDescription(`You can only bulk delete messages that are under 14 days old`);
						const msg = await message.channel.send({ embeds: [embed] });
						setTimeout(() => msg.delete(), 5000);
						return;
					}
					let embed = new MessageEmbed()
						.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
						.setDescription(`Deleted ${amount} of ${user} messages`)
						.setColor("#000000")
						.setTimestamp();
					return message.channel.send({ embeds: [embed] });
				});
			});
	}
};
