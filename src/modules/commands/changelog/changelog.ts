import { MessageEmbed, Message } from "discord.js";
import { readFileSync } from "fs";
import path from "path";
import { Command } from "../../../handler";
import { prefix, build, Repo_Link } from "../../../config.json";
import { paginationEmbed } from "../../../local_lib/functions.js";

module.exports = class extends Command {
	constructor() {
		super("changelog", {
			aliases: [],
			categories: "changelog",
			info: "Get bot changelog",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
	}

	async run(message: Message, args: string[]) {
		var pages = [];

		for (let i = 0; i < 4; i++) {
			let content = readFileSync(path.join(__dirname, `../../../local_lib/changelog/changelog${i + 1}.md`), "utf-8");
			let page = new MessageEmbed()
				.setAuthor(`${message.client.user?.username} Ver. ${build}`, `${message.client.user?.displayAvatarURL()}`, Repo_Link)
				.setTitle(`Changelog`)
				.setDescription(content)
				.setTimestamp();
			pages.push(page);
		}

		paginationEmbed(message, pages, [], 300000); // 5 Minutes
	}
};
