import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";

export class StaticState {
	currentAudio: AudioResource;
	audioLink: string;
	constructor() {
		/**
		 * The current audio resource
		 * @type {AudioResource}
		 */
		this.currentAudio = createAudioResource("");

		/**
		 * The audio link
		 * @type {string}
		 */
		this.audioLink = "";
	}

	/**
	 * @description Set current audio
	 * @param {AudioResource} audio
	 * @returns {void}
	 */
	setCurrentAudio(audio: AudioResource): void {
		this.currentAudio = audio;
	}

	/**
	 * @description Get current audio
	 * @returns {AudioResource}
	 */
	getCurrentAudio(): AudioResource {
		return this.currentAudio;
	}

	/**
	 * @description Set audio link
	 * @param {string} link - The audio link
	 * @returns {void}
	 */
	setAudioLink(link: string): void {
		this.audioLink = link;
	}

	/**
	 * @description Get audio link
	 * @returns {string}
	 */
	getAudioLink(): string {
		return this.audioLink;
	}

	/**
	 * @description Create new audio resource from link in case it expired
	 * @returns {AudioResource}
	 */
	getFreshAudioResource(): AudioResource {
		const newAudioResource: AudioResource = createAudioResource(ytdl(this.audioLink), { inlineVolume: true });
		this.setCurrentAudio(newAudioResource);

		return newAudioResource;
	}
}
