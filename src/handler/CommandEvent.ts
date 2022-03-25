import { Client } from "discord.js";
import { Toggleable } from "./Toggleable";

export class CommandEvent extends Toggleable {
	eventName: string;

	/**
	 * @description Create a new event
	 * @param {string} eventName - The name of the event
	 */
	constructor(eventName: string) {
		super();

		this.eventName = eventName;
	}

	/**
	 * @description Method that runs when the event is fired
	 */
	run(client: Client, ...args: any[]) {
		throw new Error("Event is missing run method");
	}
}
