import { MessageEmbed, Message } from "discord.js";
import { readFileSync } from "fs";
import path from "path";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils";

module.exports = class extends Command {
	build;
	repo_link;
	constructor({ prefix, build, repo_link }: handlerLoadOptionsInterface) {
		super("changelog", {
			categories: "changelog",
			info: "Get bot changelog",
			usage: `\`${prefix}command/alias\``,
			guildOnly: true,
		});
		this.build = build;
		this.repo_link = repo_link;
	}

	async run(message: Message, args: string[]) {
		var pages = [];

		for (let i = 0; i < 4; i++) {
			let content = readFileSync(path.join(__dirname, `../../../local_lib/changelog/changelog${i + 1}.md`), "utf-8");
			let page = new MessageEmbed()
				.setAuthor({ name: `${message.client.user?.username} Ver. ${this.build}`, iconURL: message.client.user?.displayAvatarURL(), url: this.repo_link })
				.setTitle(`Changelog`)
				.setDescription(content)
				.addField("Info", `This changelog list is not updated anymore, for more info check [the repo's commit history](${this.repo_link}/commits/master)`)
				.setTimestamp();
			pages.push(page);
		}

		paginationEmbed(message, pages); // 5 Minutes
	}
};
