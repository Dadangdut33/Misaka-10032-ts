import { Message, MessageEmbed } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import axios from "axios";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("verifymail", {
			aliases: ["mailcheck"],
			categories: "tool",
			info: "Verify an email using [Abstract API](https://www.abstractapi.com/)",
			usage: `${prefix}command <email that you want to check>`,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		if (args.length < 1) {
			const embed = new MessageEmbed().setTitle("Invalid Arguments Provided").setDescription(`Please enter a correct arguments. If unsure, check using \`help\` commands`);

			return message.channel.send({ embeds: [embed] });
		}

		axios
			.get(`https://emailvalidation.abstractapi.com/v1?api_key=${process.env.validateMail}&email=${args[0]}`)
			.then((response) => {
				let data = response.data;
				let embed = new MessageEmbed()
					.setAuthor({ name: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "jpg", size: 2048 }) })
					.setDescription(`**Email inputted:** \`${data.email}\`\n**Deliverability:** \`${data.deliverability}\`\n**Quality Score:** \`${data.quality_score}\``)
					.addField(`Is it valid?`, `${data.is_valid_format.text}`, true)
					.addField(`Is it free?`, `${data.is_free_email.text}`, true)
					.addField(`Is it disposable?`, `${data.is_disposable_email.text}`, true)
					.addField(`Is it a role email?`, `${data.is_role_email.text}`, true)
					.addField(`Is it a catchcall email`, `${data.is_catchall_email.text}`, true)
					.addField(`Is mx found?`, `${data.is_mx_found.text}`, true)
					.addField(`Is smtp valid?`, `${data.is_smtp_valid.text}`, true)
					.setFooter({ text: `Via Abtract API • Free plan with limit of 500/month` });

				return message.channel.send({ embeds: [embed] });
			})
			.catch((error) => {
				console.log(error);
				const embed = new MessageEmbed().setTitle(`An Error Occured!`).setDescription(`${error}`);

				return message.channel.send({ embeds: [embed] });
			});
	}
};
