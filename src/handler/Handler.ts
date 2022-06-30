import { Client, MessageEmbed, Message, TextChannel, Guild } from "discord.js";
import { createAudioPlayer, createAudioResource, NoSubscriberBehavior } from "@discordjs/voice";
import { Feature } from "./Feature";
import { Command, playerObject } from "./Command";
import { BotEvent } from "./BotEvent";
import { Utils } from "./FileUtils";
import { prefix } from "../config.json";
import { find_DB_Return, edit_DB } from "../utils";
import play from "play-dl";

export interface handlerLoadOptionsInterface {
	client: Client;
	commandHandler: Handler;
	prefix: string;
	build: string;
	repo_link: string;
}
interface IPrototype {
	prototype: ClassDecorator;
	new (...args: handlerLoadOptionsInterface[]): any;
}

export class Handler {
	client: Client;
	prefix: string;
	features: Map<string, Feature>;
	commands: Map<string, Command>;
	aliases: Map<string, Command>;
	commandEvents: Map<string, BotEvent[]>;
	// music
	radioPlayerMaps: Map<string, playerObject>;

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

		/**
		 * Maps of audio player of the bot
		 * @type {Map<string, playerObject>}
		 */
		this.radioPlayerMaps = new Map();
	}

	/**
	 * @description Load all command/event modules from a directory
	 * @param {string} directory - The directory of the modules
	 * @param {handlerLoadOptionsInterface} dependencies - The dependencies of the modules
	 */
	load(directory: string, dependencies: handlerLoadOptionsInterface) {
		/**
		 * What this does is the same as require / importing a module
		 * Ex: const fs = require("fs"); // the same as that
		 *
		 * Each of the files path is the "module" and we "require" it
		 * After that we get the "prototype" of the module to check which class it belongs to
		 * And then we create a new instance of the module
		 *
		 * That's why we use "new" on the class and pass the dependencies
		 * We can also access each dependencies that we pass by destructuring it in super()
		 *
		 * After that We store the instances as a map of each module
		 */

		// Find and require all JavaScript/Typescript files
		const nodes = Utils.readdirSyncRecursive(directory)
			.filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"))
			.map(require);

		// Load all Features
		nodes.forEach((Node: IPrototype) => {
			if (Node.prototype instanceof Feature) {
				this.loadFeature(new Node(dependencies)); // load each feature class along with passed dependencies
			}
		});

		// Load all Command and Event classes that haven't loaded yet
		nodes.forEach((Node: IPrototype) => {
			if (Node.prototype instanceof Command) {
				const loaded = Array.from(this.commands.values()).some((command) => command instanceof Node);

				if (!loaded) {
					this.loadCommand(new Node(dependencies)); // load each command class along with passed dependencies
				}
			}

			if (Node.prototype instanceof BotEvent) {
				const loaded = Array.from(this.commandEvents.values()).some((events) => events.some((event) => event instanceof Node));

				if (!loaded) {
					this.loadEvent(new Node(dependencies)); // load each event class along with passed dependencies
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
	 * @description Register music players
	 * @returns {void}
	 */
	registerPlayers(): void {
		// register music players per guild
		this.client.guilds.cache.forEach((guild) => {
			this.radioPlayerMaps.set(guild.id, {
				player: createAudioPlayer({
					behaviors: {
						noSubscriber: NoSubscriberBehavior.Play,
					},
				}),
				currentTitle: "",
				currentUrl: "",
				volume: 100, // not used but kept for future use
			});
		});

		// register music commands
		this.radioPlayerMaps.forEach(({ player, currentTitle, currentUrl, volume }, key) => {
			player.on("stateChange", async () => {
				if (player.state.status === "idle") {
					// get queue data
					const queueData = await find_DB_Return("music_state", { gid: key });
					if (queueData) {
						const queue = queueData[0].queue;

						const textChannel = this.client.channels.cache.get(queueData[0].tc_id) as TextChannel;
						if (queue.length > 0) {
							const nextSong = queue.shift();
							const stream = await play.stream(nextSong.link)!;
							const resource = createAudioResource(stream.stream, { inlineVolume: true, inputType: stream.type });

							player.play(resource);
							this.radioPlayerMaps.get(key)!.currentTitle = nextSong.title;
							this.radioPlayerMaps.get(key)!.currentUrl = nextSong.link;
							edit_DB("music_state", { gid: key }, { $set: { queue: queue } }); // update queue data

							// send message to channel
							textChannel.send({ embeds: [{ title: `▶ Continuing next song in queue`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: "RANDOM" }] });
						} else {
							edit_DB("music_state", { gid: key }, { $set: { queue: [] } }); // update queue data

							// send message telling finished playing all songs
							textChannel.send({ embeds: [{ description: "Finished playing all songs", color: "RANDOM" }] });
						}
					}
				}
			});
		});
	}

	/**
	 * @description add new player to map for guild that hasn't been added yet
	 */
	addNewPlayer(guild: Guild, playerMaps: Map<string, playerObject>, client: Client): void {
		playerMaps.set(guild.id, {
			player: createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Play,
				},
			}),
			currentTitle: "",
			currentUrl: "",
			volume: 100, // not used but kept for future use
		});

		// set events for the set player
		const playerObj = playerMaps.get(guild.id)!;
		playerObj.player.on("stateChange", async () => {
			if (playerObj.player.state.status === "idle") {
				// get queue data
				const queueData = await find_DB_Return("music_state", { gid: guild.id });
				if (queueData) {
					const queue = queueData[0].queue;

					const textChannel = client.channels.cache.get(queueData[0].tc_id) as TextChannel;
					if (queue.length > 0) {
						const nextSong = queue.shift();
						const stream = await play.stream(nextSong.link)!;
						const resource = createAudioResource(stream.stream, { inlineVolume: true, inputType: stream.type });

						playerObj.player.play(resource);
						playerMaps.get(guild.id)!.currentTitle = nextSong.title;
						playerMaps.get(guild.id)!.currentUrl = nextSong.link;
						edit_DB("music_state", { gid: guild.id }, { $set: { queue: queue } }); // update queue data

						// send message to channel
						textChannel.send({ embeds: [{ title: `▶ Continuing next song in queue`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: "RANDOM" }] });
					} else {
						edit_DB("music_state", { gid: guild.id }, { $set: { queue: [] } }); // update queue data

						// send message telling finished playing all songs
						textChannel.send({ embeds: [{ description: "Finished playing all songs", color: "RANDOM" }] });
					}
				}
			}
		});
	}

	/**
	 * @description Register the command and event handlers
	 * @returns {void}
	 */
	register(): void {
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

		this.client.once("ready", () => {
			this.registerPlayers();
		});

		// Handle commands
		this.client.on("messageCreate", async (message: Message) => {
			if (message.author.bot || !message.content.startsWith(this.prefix)) return;

			// Remove prefix and split message into command and args
			const [command, ...args] = message.content.slice(this.prefix.length).split(" ");

			let cmd = this.commands.get(command.toLowerCase());

			// if not get by name, Get the command by alias
			if (!cmd) cmd = this.aliases.get(command.toLowerCase());

			// No command or alias found
			if (!cmd) return;

			// command is disabled
			if (!cmd.isEnabled) {
				message.reply({ embeds: [{ description: `${cmd.name} is currently disabled temporarily` }] });
				return;
			}

			// guild only commands
			if (cmd.guildOnly && !message.guild) {
				message.reply("This command is only available in guilds");
				return;
			}

			// Check if the user has permissions, guild only commands
			if (cmd.permission && message.guild) {
				if (!message.member!.permissions.has(cmd.permission)) {
					message.reply("You don't have the required permissions to use this command.").then((msg) => setTimeout(() => msg.delete(), 5000));

					return;
				}
			}

			try {
				// await because the command that runs is async
				await cmd.run(message, args, {
					client: this.client,
					musicP: this.radioPlayerMaps,
					addNewPlayer: this.addNewPlayer,
				});
			} catch (err) {
				// log time
				console.log(`[${new Date().toLocaleString()}]`);
				console.error(err);
				let embed = new MessageEmbed().setTitle(`Error └[∵┌]└[ ∵ ]┘[┐∵]┘`).setDescription(`**Error Details**\n\`\`\`js\n${err}\`\`\``).setColor("#000000");

				message.reply({ embeds: [embed] });
			}
		});
	}
}
