import { Message } from "discord.js";
import { Toggleable } from "./Toggleable";

interface optionsInterface {
	name: string;
	aliases: string[];
	categories: string;
	description: string;
	usage: string;
	info: string;
	guildOnly: boolean;
}

export class Command extends Toggleable {
	name: string;
	categories: string;
	aliases: string[];
	info: string;
	usage: string;
	guildOnly: boolean;

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
	}

	/**
	 * @description Method that runs when the command is executed
	 */
	run(message: Message, args: string[]) {
		throw new Error(`Command '${this.name}' is missing run method`);
	}
}
