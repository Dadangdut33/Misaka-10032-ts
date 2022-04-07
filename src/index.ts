// keep alive by setting up a server and pinging it (if not premium)
import { Request, Response } from "express";
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => res.send("<h1>Hello World!</h1>"));
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));

// --------
import path from "path";
import { Client } from "discord.js";
import { Handler } from "./handler";
require("dotenv").config();

// --------
// client/bot
// for v13 intent 32767 is ALL INTENT
const client = new Client({ intents: 32767, allowedMentions: { parse: ["users", "roles"], repliedUser: true }, partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"] }); // partials is for cache

// v12
// const client = new Client({ disableMentions: "none", partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"] }); // partials is for cache

// load client to handler
import { prefix, build, repo_link } from "./config.json";
const handler = new Handler(client);
handler.load(path.join(__dirname, "./modules"), {
	client: client,
	commandHandler: handler,
	prefix: prefix,
	build: build,
	repo_link: repo_link,
});

// Database
import mongoose from "mongoose";

if (process.env.conn_db !== "false") {
	mongoose
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

client.login(process.env.TOKEN);
