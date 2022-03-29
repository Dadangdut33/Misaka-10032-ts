const { Random } = require("../../../../local_lib/lib/random_api");
const random = new Random();
const { Command } = require("../../../../handler");
const { prefix } = require("../../../../config");

module.exports = class extends Command {
	constructor() {
		super("neko", {
			categories: "anime-misc",
			aliases: [],
			info: "Post random neko girl image using [Neko-love API](https://neko-love.xyz/)",
			usage: `${prefix}command`,
			guildOnly: false,
		});
	}

	async run(message, args) {
		const msg = await message.channel.send(`Loading...`);

		let data = await random.getNeko().catch((e) => {
			console.log(e);
			msg.edit(`Can't reached API, try again later!`);
			return;
		});

		if (!data) {
			msg.edit(`Can't reached API, try again later!`);
			return;
		}

		msg.delete();
		message.channel.send(data);
	}
};
