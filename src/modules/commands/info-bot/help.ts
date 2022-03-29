import { MessageEmbed, Message } from "discord.js";
import { Command, Handler, handlerLoadOptionsInterface } from "../../../handler";

const mapCommands = (source: Map<string, Command>, categories: string) => {
	return `${Array.from(source)
		.filter(([, command]) => command.categories === categories)
		.map(([, command]) => `\`${command.name}\``)
		.join(` `)}`;
};

const countACategory = (source: Map<string, Command>, categories: string) => {
	return Array.from(source).filter(([, command]) => command.categories === categories).length;
};

module.exports = class extends Command {
	commandHandler;
	prefix;
	build;
	repo_link;

	// destructuring commandHandler and prefix from the command class
	constructor({ commandHandler, prefix, build, repo_link }: handlerLoadOptionsInterface) {
		super("help", {
			aliases: ["h"],
			categories: "info-bot",
			info: "Get all commands or one specific command info.",
			usage: `\`${prefix}help [command] or ${prefix}alias [command]\``,
			guildOnly: true,
		});
		this.commandHandler = commandHandler;
		this.prefix = prefix;
		this.build = build;
		this.repo_link = repo_link;
	}

	async run(message: Message, args: string[]) {
		if (args.length === 0) {
			// total all commands
			let totalCommands = this.commandHandler.commands.size;
			// categories
			let allCategories = Array.from(this.commandHandler.commands.values()).map((command) => command.categories);
			allCategories = [...new Set(allCategories)]; // remove dupe

			const embed = new MessageEmbed()
				.setTitle("Showing Full Command List!")
				.setFooter(
					`Requested by ${message.author.username}`,
					message.author.displayAvatarURL({
						format: "png",
						size: 2048,
					})
				)
				.setTimestamp()
				.setColor("RANDOM")
				.setThumbnail("https://cdn.discordapp.com/attachments/653206818759376916/795497635812343848/Kirino_Question.png")
				.setDescription(
					`All available commands for ${message.client.user?.username}#${message.client.user?.discriminator} Version \`${this.build}\`\nThe bot currently has \`${totalCommands} commands.\`\nThe bot's prefix is: \`${this.prefix}\`\nFor more details use \`\`\`ts\n${this.prefix}help <command/alias>\`\`\``
				);

			// loop the categories
			for (let category of allCategories) {
				embed.addField(`${category} [${countACategory(this.commandHandler.commands, category)}]`, mapCommands(this.commandHandler.commands, category));
			}

			// last info
			embed.addFields(
				{
					name: `Command's Source Code`,
					value: `[Click Here](https://github.com/Dadangdut33/Misaka-10032-ts/blob/main/modules/commands/${this.categories}/${this.name}.ts)`,
					inline: true,
				},
				{
					name: `Bot's Repository`,
					value: `[GitHub](${this.repo_link})`,
					inline: true,
				}
			);

			message.channel.send(embed);
		} else {
			let command = this.commandHandler.commands.get(args[0].toLowerCase());

			if (!command) {
				// check if alias
				command = this.commandHandler.aliases.get(args[0].toLowerCase());
			}

			if (!command) {
				// if not found
				const embed = new MessageEmbed().setTitle("Something went wrong!").setDescription("Invalid command provided, please try again!").setTimestamp();
				message.channel.send(embed);
				return;
			}

			const embed = new MessageEmbed()
				.setTitle(`Details For \`${command.name}\` Command!`)
				.setFooter(`Parameters: <> = required, [] = optional`)
				.setTimestamp()
				.setColor("RANDOM")
				.setAuthor(
					`Requested by ${message.author.username}`,
					message.author.displayAvatarURL({
						format: "png",
						size: 2048,
					})
				)
				.setThumbnail("https://cdn.discordapp.com/attachments/653206818759376916/740451618344009800/unknown.png")
				.addField(`Command Name`, `${command.name}`, true)
				.addField(`Aliases`, `${command.aliases.length > 0 ? command.aliases.join(", ") : "-"}`, true)
				.addField(`Category`, `${command.categories}`, true)
				.addField(`Guild Only`, `${command.guildOnly}`, false)
				.addField(`Description`, `${command.info}`)
				.addField(`Usage`, `${command.usage}`)
				.addField(`Command's Source Code`, `[Click Here](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/commands/${command.categories}/${command.name}.ts)`, true)
				.addField(`Bot's Repository`, `[GitHub](${this.repo_link})`, true);

			message.channel.send(embed);
		}
	}
};
