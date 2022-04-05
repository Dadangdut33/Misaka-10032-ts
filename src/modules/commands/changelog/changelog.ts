import { MessageEmbed, Message } from "discord.js";
import { readFileSync } from "fs";
import path from "path";
import { Command, handlerLoadOptionsInterface } from "../../../handler";
import { paginationEmbed } from "../../../utils/functions.js";

module.exports = class extends Command {
	build;
	repo_link;
	constructor({ prefix, build, repo_link }: handlerLoadOptionsInterface) {
		super("changelog", {
			aliases: [],
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
				.setAuthor(`${message.client.user?.username} Ver. ${this.build}`, `${message.client.user?.displayAvatarURL()}`, this.repo_link)
				.setTitle(`Changelog`)
				.setDescription(content)
				.setTimestamp();
			pages.push(page);
		}

		paginationEmbed(message, pages, [], 300000); // 5 Minutes
	}
};
function Repo_Link(arg0: string, arg1: string, Repo_Link: any) {
	throw new Error("Function not implemented.");
}
