import { Message } from "discord.js";
import { Command, handlerLoadOptionsInterface } from "../../../handler";

module.exports = class extends Command {
	constructor({ prefix }: handlerLoadOptionsInterface) {
		super("resetrole", {
			categories: "moderation",
			info: "Reset roles, only usable by admin and mods",
			usage: `\`${prefix}command/alias <tagged roles>\``,
			guildOnly: true,
			permission: "ADMINISTRATOR",
		});
	}

	async run(message: Message, args: string[]) {
		if (args.length < 1) return;

		// get all tagged roles and convert to array
		const taggedRoles = message.mentions.roles.map((r) => r);

		if (taggedRoles.length < 1) return message.channel.send("You need to tag at least one role!").then((msg) => setTimeout(() => msg.delete(), 5000));

		// get the guild
		const guild = message.guild!;

		// send msg
		const msg = await message.channel.send("Resetting roles...");

		try {
			// loop member of the guild and remove their roles
			guild.members.cache.forEach((member) => {
				// loop through the tagged roles
				taggedRoles.forEach((role) => {
					// remove the role from the member
					member.roles.remove(role);
				});
			});
			msg.edit("__**Roles have been reset successfully!**__ Might take a while to see the changes.");
		} catch (error) {
			console.log(error);
			msg.edit("__**Something went wrong!**__\n```js\n" + error + "```");
		}
	}
};
