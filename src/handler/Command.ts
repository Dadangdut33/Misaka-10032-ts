import { Message } from "discord.js";
import { Toggleable } from "./Toggleable";

interface optionsInterface {
	aliases?: string[];
	categories: string;
	usage: string;
	info: string;
	guildOnly: boolean;
	permission?:
		| "ADMINISTRATOR"
		| "MANAGE_MESSAGES"
		| "MANAGE_CHANNELS"
		| "MANAGE_ROLES"
		| "MANAGE_GUILD"
		| "KICK_MEMBERS"
		| "BAN_MEMBERS"
		| "CREATE_INSTANT_INVITE"
		| "MANAGE_NICKNAMES"
		| "MANAGE_WEBHOOKS"
		| "MANAGE_EMOJIS";
}

export class Command extends Toggleable implements optionsInterface {
	name: string;
	aliases: string[];
	categories;
	info;
	usage;
	guildOnly;
	permission?;

	/**
	 * @description Create a new command
	 * @param {string} name - The name of the command
	 * @param {object} options - The options for this command
	 * @param {string[]} [options.aliases] - Aliases of this command
	 * @param {string} [options.info] - Information about this command
	 * @param {string} [options.usage] - Usage of this command
	 * @param {string} [options.categories] - Command categories
	 * @param {boolean} [options.guildOnly] - Whether the command can only be used inside a guild
	 */
	constructor(name: string, options: optionsInterface) {
		super();

		this.name = name;
		this.categories = options.categories;
		this.info = options.info;
		this.usage = options.usage;
		this.guildOnly = options.guildOnly;

		// alias set
		if (options.aliases) this.aliases = options.aliases;
		else this.aliases = [];

		// permission set
		if (options.permission) {
			this.permission = options.permission;
		}
	}

	/**
	 * @description Method that runs when the command is executed
	 */
	run(message: Message, args: string[]) {
		throw new Error(`Command '${this.name}' is missing run method`);
	}
}
