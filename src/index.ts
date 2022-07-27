import mongoose from "mongoose"; // db
import express, { Request, Response } from "express"; // keep alive by setting up a server and pinging it (if not premium)
const app = express();
const port = process.env.PORT || 10032;

app.get("/", (_req: Request, res: Response) => res.send("<h1>Hello World!</h1>"));
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
	// verify env
	if (!process.env.TOKEN) throw new Error("ERROR!!! Token is not set");
	// warn
	if (!process.env.Server_invite) console.warn("WARNING!!! Server invite is not set");
	if (!process.env.RapidKey) console.warn("WARNING!!! Rapid API key is not set");
	if (!process.env.Mangadex_Username) console.warn("WARNING!!! Mangadex username is not set");
	if (!process.env.Mangadex_Password) console.warn("WARNING!!! Mangadex password is not set");
	if (!process.env.validatePhone) console.warn("WARNING!!! Abstract API validatephone key is not set");
	if (!process.env.validateMail) console.warn("WARNING!!! Abstract API validateemail key is not set");
	if (!process.env.Genius_Key) console.warn("WARNING!!! Genius API key is not set");
	if (!process.env.SAUCENAO_API_KEY) console.warn("WARNING!!! SauceNao API key is not set");

	if (process.env.conn_db !== "false") {
		// needed
		if (!process.env.MONGODB_SRV) throw new Error("ERROR!!! MONGODB_SRV is not defined");

		await mongoose
			.connect(process.env.MONGODB_SRV!, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
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
