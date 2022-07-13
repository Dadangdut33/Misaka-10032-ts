import mongoose from "mongoose"; // db
import express, { Request, Response } from "express"; // keep alive by setting up a server and pinging it (if not premium)
const app = express();
const port = process.env.PORT || 10032;

app.get("/", (req: Request, res: Response) => res.send("<h1>Hello World!</h1>"));
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));

// --------
import path from "path";
import { Client } from "discord.js";
import { Handler } from "./handler";
import { prefix, build, repo_link } from "./config.json";
require("dotenv").config();

// --------
// client/bot
// for v13 intent 32767 is ALL INTENT
const client = new Client({ intents: 32767, allowedMentions: { parse: ["users", "roles"], repliedUser: true }, partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"] }); // partials is for cache

// v12
// const client = new Client({ disableMentions: "none", partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"] }); // partials is for cache

(async () => {
	if (process.env.conn_db !== "false") {
		await mongoose
			.connect(process.env.MONGODB_SRV!, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
			})
			.then(() => {
				console.log(`Connected to database!`);
			})
			.catch((err: any) => {
				console.log(err);
			});
	}

	// load client to handler
	const handler = new Handler(client);
	handler.load(path.join(__dirname, "./modules"), {
		client: client,
		commandHandler: handler,
		prefix: prefix,
		build: build,
		repo_link: repo_link,
	});

	client.login(process.env.TOKEN);
})();
