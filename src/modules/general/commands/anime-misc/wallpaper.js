const { Random } = require("../../../../local_lib/api_call/random");
const random = new Random();
const { Command } = require("../../../../handler");
const { prefix } = require("../../../../config");

module.exports = class extends Command {
	constructor() {
		super("wallpaper", {
			categories: "anime-misc",
			aliases: [],
			info: "Post random anime wallpaper fetched from [Nekos.life API](https://nekos.life/)",
			usage: `${prefix}command`,
			guildOnly: false,
		});
	}

	async run(message, args) {
		let data = await random.getWallpaper();
		message.channel.send(data);
	}
};
