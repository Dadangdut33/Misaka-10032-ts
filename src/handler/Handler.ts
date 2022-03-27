import { Client, MessageEmbed, Message } from "discord.js";
import { Feature } from "./Feature";
import { Command } from "./Command";
import { BotEvent } from "./BotEvent";
import { Utils } from "../local_lib/Utils";
import { prefix } from "../config.json";

export class Handler {
	client: Client;
	prefix: string;
	features: Map<string, Feature>;
	commands: Map<string, Command>;
	aliases: Map<string, Command>;
	commandEvents: Map<string, BotEvent[]>;

	/**
	 * @description Create a new handler instance
	 * @param {Client} client - The discord.js client
	 * @param {string} prefix - The prefix of the bot
	 */
	constructor(client: Client) {
		/**
		 * The discord.js client
		 * @type {Client}
		 */
		this.client = client;

		/**
		 * The prefix of the bot
		 * @type {string}
		 */
		this.prefix = prefix;

		/**
		 * A map of all features
		 * @type {Map<string, Feature>}
		 */
		this.features = new Map();

		/**
		 * A map containing all the commands, mapped by command name
		 * @type {Map<string, Command>}
		 */
		this.commands = new Map();

		/**
		 * A map containing all the commands, mapped by alias
		 * @type {Map<string, Command>}
		 */
		this.aliases = new Map();

		/**
		 * A map containing all the commandEvents, mapped by event name
		 * @type {Map<string, BotEvent[]>}
		 */
		this.commandEvents = new Map();
	}

	/**
	 * @description Load all command/event modules from a directory
	 * @param {string} directory - The directory of the modules
	 * @param {object} dependencies - The dependencies of the modules
	 */
	load(directory: string, dependencies: object) {
		// Find and require all JavaScript files
		const nodes = Utils.readdirSyncRecursive(directory)
			.filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"))
			.map(require);

		// Load all Features
		nodes.forEach((Node: any) => {
			if (Node.prototype instanceof Feature) {
				this.loadFeature(new Node(dependencies));
			}
		});

		// Load all Command and Event classes that haven't loaded yet
		nodes.forEach((Node: any) => {
			if (Node.prototype instanceof Command) {
				const loaded = Array.from(this.commands.values()).some((command) => command instanceof Node);

				if (!loaded) {
					this.loadCommand(new Node(dependencies));
				}
			}

			if (Node.prototype instanceof BotEvent) {
				const loaded = Array.from(this.commandEvents.values()).some((events) => events.some((event) => event instanceof Node));

				if (!loaded) {
					this.loadEvent(new Node(dependencies));
				}
			}
		});

		// Register loaded commands and events
		this.register();
	}

	/**
	 * @description Load a feature and it's commands
	 * @param {Feature} feature - The feature that needs to be loaded
	 */
	loadFeature(feature: Feature) {
		if (this.features.has(feature.name)) {
			throw new Error(`Can't load Feature, the name '${feature.name}' is already used`);
		}

		this.features.set(feature.name, feature);

		feature.commands.forEach((command) => {
			this.loadCommand(command);
		});

		feature.commandEvents.forEach((event) => {
			this.loadEvent(event);
		});
	}

	/**
	 * @description Load a command
	 * @param {Command} command - The command that needs to be loaded
	 */
	loadCommand(command: Command) {
		// Command name might be in use or name might already be an existing alias
		if (this.commands.has(command.name) || this.aliases.has(command.name)) {
			throw new Error(`Can't load command, the name '${command.name}' is already used as a command name or alias`);
		}

		this.commands.set(command.name, command);

		command.aliases.forEach((alias) => {
			// Alias might already be a command or might already be in use
			if (this.commands.has(alias) || this.aliases.has(alias)) {
				// if dupe throw error
				throw new Error(`Can't load command, the alias '${alias}' is already used as a command name or alias`);
			}

			if (alias.length > 0) {
				this.aliases.set(alias, command);
			}
		});
	}

	/**
	 * @description Load an event
	 * @param {Event} event - The event that needs to be loaded
	 */
	loadEvent(event: BotEvent) {
		const events = this.commandEvents.get(event.eventName) || [];
		events.push(event);

		this.commandEvents.set(event.eventName, events);
	}

	/**
	 * @description Register the command and event handlers
	 */
	register() {
		// Handle events
		for (const [name, handlers] of this.commandEvents) {
			this.client.on(name, (...params) => {
				for (const handler of handlers) {
					// Run event if enabled
					if (handler.isEnabled) {
						try {
							handler.run(this.client, ...params);
						} catch (err) {
							console.error(err);
						}
					}
				}
			});
		}

		// Handle commands
		this.client.on("message", async (message: Message) => {
			if (message.author.bot || !message.content.startsWith(this.prefix)) {
				return;
			}

			// Remove prefix and split message into command and args
			const [command, ...args] = message.content.slice(this.prefix.length).split(" ");

			let cmd = this.commands.get(command.toLowerCase());

			if (!cmd) {
				// Get the command by alias
				cmd = this.aliases.get(command.toLowerCase());
			}

			if (!cmd || !cmd.isEnabled) {
				// No command or alias found or command is disabled
				return;
			}

			if (cmd.guildOnly && !message.guild) {
				message.channel.send("This command is only available in guilds");
				return;
			}

			try {
				await cmd.run(message, args); // await because the command that runs is async
			} catch (err) {
				console.error(err);
				let embed = new MessageEmbed().setTitle(`Error └[∵┌]└[ ∵ ]┘[┐∵]┘`).setDescription(`**Error Details**\n${err}`).setColor("#000000");

				message.channel.send(embed);
			}
		});
	}
}
