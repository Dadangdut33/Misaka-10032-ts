import { Command } from "./Command";
import { BotEvent } from "./BotEvent";
import { Toggleable } from "./Toggleable";

export class Feature extends Toggleable {
	name: string;
	commands: Command[];
	commandEvents: BotEvent[];

	/**
	 * @description Create a new Feature
	 * @param {string} name - The name of this Feature
	 */
	constructor(name: string) {
		super();

		/**
		 * The name of this feature
		 * @type {String}
		 */
		this.name = name;

		/**
		 * All commands that belong to this Feature
		 * @type {Array<Command>}
		 */
		this.commands = [];

		/**
		 * All events that belong to this Feature
		 * @type {Array<Event>}
		 */
		this.commandEvents = [];
	}

	/**
	 * @description Register a new command
	 * @param {Command} command - The command that needs to be registered
	 */
	registerCommand(command: Command) {
		this.commands.push(command);
	}

	/**
	 * @description Register a new event
	 * @param {Event} event - The event that needs to be registered
	 */
	registerEvent(event: BotEvent) {
		this.commandEvents.push(event);
	}

	/**
	 * @description Toggle this Feature and it's commands and events
	 * @returns {undefined}
	 * @override
	 */
	toggle() {
		if (this.isEnabled) {
			this.disable();
		} else {
			this.enable();
		}
	}

	/**
	 * @description Enable this Feature and it's commands and events
	 * @returns {undefined}
	 * @override
	 */
	enable() {
		super.enable();

		this.commands.forEach((command) => command.enable());
		this.commandEvents.forEach((event) => event.enable());
	}

	/**
	 * @description Disable this Feature and it's commands and events
	 * @returns {undefined}
	 * @override
	 */
	disable() {
		super.disable();

		this.commands.forEach((command) => command.disable());
		this.commandEvents.forEach((event) => event.disable());
	}
}
