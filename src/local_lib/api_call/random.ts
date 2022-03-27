const fetch = require("node-fetch");

export class Random {
	async getMeme() {
		const main = await fetch("https://apis.duncte123.me/meme");
		const mat: any = await main.json();

		if (!mat.success) {
			return "Error 01: Unable to access the json content of API";
		}

		let content = {
			embed: {
				color: "RANDOM",
				title: mat.data.title,
				image: { url: mat.data.image },
			},
		};

		return content;
	}

	async getJoke() {
		const main = await fetch("https://apis.beta.duncte123.me/joke"); //https://apis.beta.duncte123.me/joke https://apis.duncte123.me/joke
		const mat: any = await main.json();

		if (!mat.success) {
			return "Error 01: Unable to access the json content of API";
		}

		let content = {
			embed: {
				color: "RANDOM",
				title: mat.data.title,
				url: mat.data.url,
				description: mat.data.body,
			},
		};

		return content;
	}

	async getKitsune() {
		const main = await fetch("https://neko-love.xyz/api/v1/kitsune");
		const mat: any = await main.json();

		if (mat.code !== 200) {
			return "Error 01: Unable to access the json content of API";
		}
		const chars: any = { "/": "%2F", ":": "%3A" };

		let content = {
			embed: {
				color: "RANDOM",
				title: `Gao~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${mat.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: mat.url },
			},
		};

		return content;
	}

	async getNeko() {
		const main = await fetch("https://neko-love.xyz/api/v1/neko");
		const mat: any = await main.json();

		if (mat.code !== 200) {
			return "Error 01: Unable to access the json content of API";
		}

		//REPLACE the chars for sauceNAO
		const chars: any = { "/": "%2F", ":": "%3A" };

		let content = {
			embed: {
				color: "RANDOM",
				title: "Nya nya~",
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${mat.url.replace(/[:/]/g, (m: number) => chars[m])})`,
				image: { url: mat.url },
			},
		};

		return content;
	}

	async getNekoGif() {
		const main = await fetch("https://nekos.life/api/v2/img/ngif");
		const mat: any = await main.json();

		const chars: any = { "/": "%2F", ":": "%3A" };

		let content = {
			embed: {
				color: "RANDOM",
				title: `Nya nya~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${mat.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: mat.url },
			},
		};

		return content;
	}

	async getNekoV2() {
		const main = await fetch("https://nekos.life/api/v2/img/neko");
		const mat: any = await main.json();

		const chars: any = { "/": "%2F", ":": "%3A" };
		let content = {
			embed: {
				color: "RANDOM",
				title: `Nya nya~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${mat.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: mat.url },
			},
		};

		return content;
	}

	async getWallpaper() {
		const main = await fetch("https://nekos.life/api/v2/img/wallpaper");
		const mat: any = await main.json();

		const chars: any = { "/": "%2F", ":": "%3A" };
		let content = {
			embed: {
				color: "RANDOM",
				title: `Via Nekos.life`,
				url: `https://nekos.life/`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${mat.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: mat.url },
			},
		};

		return content;
	}

	async getAnimeImgURL(action: "pat" | "hug" | "waifu" | "cry" | "kiss" | "slap" | "smug" | "punch") {
		let array = ["pat", "hug", "waifu", "cry", "kiss", "slap", "smug", "punch"];

		if (!array.find((x) => x === action.toLowerCase())) {
			return "Unknown Action name, options of action are - " + array.join(", ");
		}

		const main = await fetch("https://neko-love.xyz/api/v1/" + action.toLowerCase());
		const mat: any = await main.json();

		return mat.url;
	}

	async getAnimeImgURLV2(action: "pat" | "hug" | "tickle" | "kiss" | "slap" | "poke" | "cuddle") {
		let array = ["pat", "hug", "tickle", "kiss", "slap", "poke", "cuddle"];

		if (!array.find((x) => x === action.toLowerCase())) {
			return "Unknown Action name, options of action are - " + array.join(", ");
		}

		const main = await fetch("https://nekos.life/api/v2/img/" + action.toLowerCase());
		const mat: any = await main.json();

		return mat.url;
	}

	async getAdvice() {
		const main = await fetch("https://api.adviceslip.com/advice");
		const mat: any = await main.json();

		let content = {
			embed: {
				description: mat.slip.advice,
				color: "RANDOM",
			},
		};

		return content;
	}

	async getShip(stringArr: string[]) {
		let localChar = stringArr.toString();

		const replacer: any = { ",": "%20", x: "/" };
		let chara = localChar.replace(/[,x]/gi, (m: string) => replacer[m]);

		const main = await fetch(
			// "https://apis.duncte123.me/love/" + char1 + `/` + char2
			// "https://apis.duncte123.me/love/" + chara
			"https://apis.beta.duncte123.me/love/" + chara
		);
		const mat: any = await main.json();

		if (!mat.success) {
			return "Error 01: Unable to access the json content of API";
		}

		let content = {
			embed: {
				color: "RANDOM",
				title: `The Algorithm has spoken`,
				description: `The calculated score of ${mat.data.names} is \`${mat.data.score_int}%\`\n\n${mat.data.message}`,
			},
		};

		return content;
	}
}
