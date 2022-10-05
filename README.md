# Misaka-10032

A Personal discord bot that I code and use for my personal discord server. Now uses discord.js v13 and typescript.

<details open>
  <summary><b>Preview</b></summary>
  <p align="center">
    <img src="https://raw.githubusercontent.com/Dadangdut33/Misaka-10032-ts/master/preview.png">
  </p>
</details>

---

# 📌 Getting Started

First clone the repo and install all the packages by doing `npm install` or `npm ci` Then run the bot by doing `npm run dev`.

Alternatively, you can build/compile the bot to js by doing `npm run build`. You can also start the builded version by doing `npm run start-build`. Or you can build and run the file directly by running `npm run build-run`.

This bot is hosted on [cyclic](https://app.cyclic.sh).

## 🔑 Project ENV

All tokens needed **must** be stored and contained in .env file, there is an example that contains all needed token in [here](.env.example).

## 🔏 Certain server events

[This folder](src/modules/events/private/) contains events that only run on certain server. You can modify it for your own personal use if you want. You can also disable it by deleting the file or just uncomment `this.disable()`.

## ⚙ config.json

Set bot prefix and some other info here. You can ignore the [private_Events_Info field](src/config.json) in config.json, it contains ids of channel and server for the private events.

# ❓ Questions?

Feel free to ask me in discussions if you have any questions

# 🚀 Want to contribute?

You can open an issue or pull request. I will be glad to help.
