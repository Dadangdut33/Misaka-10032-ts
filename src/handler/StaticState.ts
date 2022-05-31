import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";

type localStatus = "playing" | "stopped" | "";
export class StaticState {
	currentAudio: AudioResource;
	audioLink: string;
	localStatus: localStatus;
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

		/**
		 * The local status
		 * @type {string}
		 */
		this.localStatus = "";
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
	async getFreshAudioResource(link?: string): Promise<AudioResource<unknown>> {
		const videoInfo = await ytdl.getInfo(link ? link : this.audioLink);

		const newAudioResource: AudioResource = createAudioResource(
			ytdl(link ? link : this.audioLink, {
				quality: videoInfo.videoDetails.isLiveContent ? [128, 127, 120, 96, 95, 94, 93] : "highestaudio",
			}),
			{ inlineVolume: true }
		);
		this.setCurrentAudio(newAudioResource);

		return newAudioResource;
	}

	/**
	 * @description Set local status
	 * @param {string} status - The local status
	 * @returns {void}
	 */
	setLocalStatus(status: localStatus): void {
		this.localStatus = status;
	}

	/**
	 * @description Get local status
	 * @returns {localStatus}
	 */
	getLocalStatus(): localStatus {
		return this.localStatus;
	}
}
