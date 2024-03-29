import { Client, MessageEmbed, Message, TextChannel, Guild } from "discord.js";
import { createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";
import { Feature } from "./Feature";
import { Command, musicSettingsInterface } from "./Command";
import { BotEvent } from "./BotEvent";
import { Utils } from "./FileUtils";
import { prefix } from "../config.json";
import { find_DB_Return, updateOne_Collection, insert_collection } from "../utils";
import { stream } from "play-dl";
import { Client as ytClient, PlaylistCompact, VideoCompact } from "youtubei";
const searchClient = new ytClient();

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
	radioPlayerMaps: musicSettingsInterface;

	/**
	 * @description Create a new handler instance
	 * @param {Client} client - The discord.js client
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
		console.log(`Loading handler...`);
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
			this.addNewPlayer(guild, this.radioPlayerMaps, this.client);
		});
	}

	/**
	 * @description add new player to map for guild that hasn't been added yet
	 */
	addNewPlayer(guild: Guild, playerMaps: musicSettingsInterface, client: Client): void {
		playerMaps.set(guild.id, {
			player: createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Play,
				},
			}),
			currentId: "",
			currentTitle: "",
			currentUrl: "",
			query: "",
			seekTime: 0,
			loop: false,
			auto: false,
			volume: 100, // not used but kept for future use
			timeOutIdle: setTimeout(() => {}),
			relatedIdTakenThisSession: [],
		});

		// set events for the set player
		const playerObj = playerMaps.get(guild.id)!;
		playerObj.player.on("stateChange", async () => {
			// verify if idle or stopped
			if (playerObj.player.state.status !== "idle") return;

			// get queue data & verify if guild is registered or not
			const queueData = await find_DB_Return("music_state", { gid: guild.id });
			if (queueData.length === 0) {
				insert_collection("music_state", { gid: guild.id, vc_id: "", tc_id: "", queue: [] });
				return;
			}

			// Get text channel if registered
			const textChannel = client.channels.cache.get(queueData[0].tc_id) as TextChannel;
			const msgInfo = await textChannel.send({ embeds: [{ title: "Loading queue...", color: 0x00ff00 }] });

			try {
				// *if loop
				if (playerObj.loop) {
					const streamInfo = await stream(playerObj.currentUrl, { quality: 1250, precache: 1000 })!;
					const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });

					playerObj.player.play(resource);
					playerMaps.get(guild.id)!.seekTime = 0;

					// send message to channel
					msgInfo.edit({ embeds: [{ title: `▶ Looping current song`, description: `Now playing: [${playerObj.currentTitle}](${playerObj.currentUrl})`, color: "RANDOM" }] });

					return;
				}

				// *if auto
				if (playerObj.auto) {
					msgInfo.edit({ embeds: [{ title: `⏳ Loading next video in autoplay`, description: `Please wait...`, color: "RANDOM" }] });

					// update related id taken this session
					playerMaps.get(guild.id)!.relatedIdTakenThisSession.push(playerObj.currentId);
					// get related videos
					const relatedGet = await searchClient.getVideo(playerObj.currentId);

					if (!relatedGet) {
						msgInfo.edit({ embeds: [{ title: `⏳ No related video found`, description: `Please try again later`, color: "RANDOM" }] });
						playerObj.auto = false;
						return;
					}

					// filter out related songs that have been played this session
					let filteredNext = relatedGet.related.items.filter((x) => !playerObj.relatedIdTakenThisSession.includes(x.id)) as (VideoCompact | PlaylistCompact)[];
					// filter any playListCompact. Playlist compact does not have duration properties
					// @ts-ignore
					filteredNext = filteredNext.filter((x) => x.duration);
					const nextVideo = filteredNext[0] as VideoCompact;

					const urlGet = "https://www.youtube.com/watch?v=" + nextVideo.id;
					const streamData = await stream(urlGet, { quality: 1250, precache: 1000 })!;
					const resource = createAudioResource(streamData.stream, { inlineVolume: true, inputType: streamData.type });

					playerObj.player.play(resource);
					playerMaps.get(guild.id)!.currentId = nextVideo.id;
					playerMaps.get(guild.id)!.currentTitle = nextVideo.title;
					playerMaps.get(guild.id)!.currentUrl = urlGet;
					playerMaps.get(guild.id)!.seekTime = 0;

					// edit embed
					msgInfo.edit({
						embeds: [
							{
								author: { name: "▶ Autoplaying next song" },
								title: `Now playing ${!nextVideo.isLive ? "🎵" : "📺"}`,
								description: `**[${nextVideo.title}](${urlGet})** ${nextVideo.channel ? `by [${nextVideo.channel?.name}](${nextVideo.channel?.url})` : ``}`,
								fields: [
									{
										name: "Live / Duration",
										value: `${nextVideo.isLive ? "Yes" : "No"} / ${nextVideo.duration} seconds`,
										inline: true,
									},
									{
										name: "Views",
										value: nextVideo.viewCount ? `${nextVideo.viewCount.toLocaleString()}` : "Unknown",
										inline: true,
									},
									{
										name: "Upload date",
										value: `${nextVideo.uploadDate}`,
										inline: true,
									},
								],
								color: 0x00ff00,
								thumbnail: {
									url: `https://img.youtube.com/vi/${nextVideo.id}/hqdefault.jpg`,
								},
							},
						],
					});

					return;
				}

				// *if not loop and auto check if queue is empty or not
				const queue = queueData[0].queue;
				if (queue.length > 0) {
					// *if queue is not empty
					const nextSong = queue.shift();
					const streamInfo = await stream(nextSong.link, { quality: 1250, precache: 1000 })!;
					const resource = createAudioResource(streamInfo.stream, { inlineVolume: true, inputType: streamInfo.type });

					playerObj.player.play(resource);
					playerMaps.get(guild.id)!.currentId = nextSong.id;
					playerMaps.get(guild.id)!.currentTitle = nextSong.title;
					playerMaps.get(guild.id)!.currentUrl = nextSong.link;
					playerMaps.get(guild.id)!.seekTime = 0;
					playerMaps.get(guild.id)!.query = nextSong.query;
					updateOne_Collection("music_state", { gid: guild.id }, { $set: { queue: queue } }); // update queue data

					// send message to channel
					msgInfo.edit({ embeds: [{ title: `▶ Continuing next song in queue`, description: `Now playing: [${nextSong.title}](${nextSong.link})`, color: "RANDOM" }] });
				} else {
					// *if queue is empty
					updateOne_Collection("music_state", { gid: guild.id }, { $set: { queue: [] } }); // update queue data
					playerMaps.get(guild.id)!.seekTime = 0;

					// send message telling finished playing all songs
					msgInfo.edit({
						embeds: [
							{
								title: "Finished playing all songs",
								description: "Bot will automatically leave the VC in 5 minutes if no more song is playing.",
								color: "RANDOM",
							},
						],
					});

					// start timeout
					playerObj.timeOutIdle = setTimeout(() => {
						if (getVoiceConnection(guild.id)) getVoiceConnection(guild.id)?.destroy();
						else guild.me?.voice.disconnect();

						playerMaps.get(guild.id)!.relatedIdTakenThisSession = []; // reset relatedIdTaken
						playerObj.player.stop(); // stop player
					}, 300000); // 5 minutes
				}
			} catch (err) {
				console.log(`[${new Date().toLocaleString()}]`);
				console.error(err);
				msgInfo.edit({ embeds: [{ title: "Error", description: `An error occured while trying to play the song.\n\n\`\`\`${err}\`\`\``, color: "RANDOM" }] });
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
				let embed = new MessageEmbed().setAuthor({ name: "└[∵┌]└[ ∵ ]┘[┐∵]┘" }).setTitle(`Error!!`).setDescription(`**Error Details**\n\`\`\`js\n${err}\`\`\``).setColor("#000000");

				message.reply({ embeds: [embed] });
			}
		});
	}
}
