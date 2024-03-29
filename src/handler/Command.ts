import { Client, Guild, Message, PermissionString } from "discord.js";
import { AudioPlayer } from "@discordjs/voice";
import { Toggleable } from "./Toggleable";

interface optionsInterface {
	aliases?: string[];
	categories: "action" | "changelog" | "fun" | "info-bot" | "info-server" | "moderation" | "music" | "muslim" | "anime" | "anime-misc" | "genshin" | "info-misc" | "manga" | "text" | "tool";
	usage: string; // "commmand" and "alias" is a reserved word in usage that will replace with the command name and alias
	info: string;
	guildOnly: boolean;
	permission?: PermissionString;
}

export type musicSettingsInterface = Map<string, playerObject>;
export type addNewPlayerArgsInterface = (guild: Guild, playerMaps: musicSettingsInterface, client: Client) => void;
export interface playerObject {
	player: AudioPlayer;
	currentId: string;
	currentTitle: string;
	currentUrl: string;
	query: string;
	seekTime: number;
	loop: boolean;
	auto: boolean;
	volume: number;
	/** Bot leave timeout, will reset everytime new song is added by play command */
	timeOutIdle: NodeJS.Timeout;
	/** Store related video that has been played this session. Will reset everytime bot stop playing music */
	relatedIdTakenThisSession: string[];
}

interface extraArgsInterface {
	client: Client;
	musicP: musicSettingsInterface;
	addNewPlayer: addNewPlayerArgsInterface;
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
		this.guildOnly = options.guildOnly;

		// alias set
		if (options.aliases) this.aliases = options.aliases;
		else this.aliases = [];

		// map options usage with this:
		options.usage = options.usage.replace(/command/g, this.name);
		options.usage = options.usage.replace(/alias/g, this.aliases.join("/"));

		this.usage = options.usage;

		// permission set
		if (options.permission) {
			this.permission = options.permission;
		}
	}

	/**
	 * @description Method that runs when the command is executed
	 */
	async run(message: Message, args: string[], extraArgs: extraArgsInterface): Promise<any> {
		throw new Error(`Command '${this.name}' is missing run method`);
	}
}
