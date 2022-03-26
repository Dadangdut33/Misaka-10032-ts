# Misaka-10032
A Personal discord bot i made. I use it for my private discord server. **Rewrite in typescript (Still in proggress)**. I rewrite it to learn more about typescript.

<details open>
  <summary><b>Preview</b></summary>
  <p align="center">
    <img src="https://github.com/Dadangdut33/Misaka-10032/blob/main/preview.png?raw=true">
  </p>
</details>

---
## Some info
The bot is currently still in proggress of rewrite in typescript and still using discord.js v12. After rewrite in typescript is done, i will try to use discord.js v13.

## Getting Started
If you want to clone it and use it for your server, you gonna have to change some stuff.

   - What you will need to modify
     1. **[Channel ID & Server ID for member count, channel log, and server info]** You need to change the id if you want to use it. It is used in [Member-count.js](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/events/types/private/member-count.js), [start.js](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/events/start.js), and [server-info](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/events/types/private/server-info.js) 
     2. **[The repository link]** change the repository links in [help.js](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/commands/info-bot/help.js) 
     3. **[The .env]** The .env contains many sensitive information. You need to create a .env file based on the .env.example.
     <br/>
     
   - Optional
     1. You should probably change the [about](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/commands/info-bot/about.js) info commands
     2. You can also changed the haiku detection settings in [msgListener.js](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/events/types/msgListener.js), i turned up the sensitivity cause it's not really working in the language that i use (Indonesia)
     3. You can also change [this meme responses](https://img-comment-fun.9cache.com/media/aOv2bpN/axNG6q5j_700w_0.jpg). That are located in [meme-response.js](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/events/types/public/random-response/meme-response.js)
     4. You can change or disable some of the events listeners in [start.js](https://github.com/Dadangdut33/Misaka-10032/blob/main/modules/general/events/start.js). 
     
## How to start the bot
First install all the packages by doing `npm install` Then run the bot by doing `npm start`.
Alternatively, you can build/compile the bot to js by doing `npm run build`. You can also start the builded version by doing `npm run start-build`. Or you can build and run the file directly by running `npm run build-run`.

## Questions?
Feel free to ask me in discussions if you have any questions

## Disclaimer
Originally i used an open source template for this discord bot but i can't remember the link of the repository. I'm really sorry that i cannot link it. If you are the owner of that repo and you want me to link it please message me.<br/><br/>
