import { Message } from "discord.js";
import { Toggleable } from "./Toggleable";

interface optionsInterface {
	aliases: string[];
	categories: string;
	usage: string;
	info: string;
	guildOnly: boolean;
	permissions?:
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

export class Command extends Toggleable {
	name: string;
	categories: string;
	aliases: string[];
	info: string;
	usage: string;
	guildOnly: boolean;
	permissions?:
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
		this.aliases = options.aliases;
		this.info = options.info;
		this.usage = options.usage;
		this.guildOnly = options.guildOnly;

		if (options.permissions) {
			this.permissions = options.permissions;
		}
	}

	/**
	 * @description Method that runs when the command is executed
	 */
	run(message: Message, args: string[]) {
		throw new Error(`Command '${this.name}' is missing run method`);
	}
}
