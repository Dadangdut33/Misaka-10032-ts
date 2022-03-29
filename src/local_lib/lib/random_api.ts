import axios from "axios";

export class Random {
	async getMeme() {
		const { data }: any = await axios.get("https://apis.duncte123.me/meme");

		return data;
	}

	async getJoke() {
		const { data }: any = await axios.get("https://apis.beta.duncte123.me/joke"); //https://apis.beta.duncte123.me/joke https://apis.duncte123.me/joke

		return data;
	}

	async getKitsune() {
		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/kitsune");

		if (data.code !== 200) {
			return "Error 01: Unable to access the json content of API";
		}
		const chars: any = { "/": "%2F", ":": "%3A" };

		let content = {
			embed: {
				color: "RANDOM",
				title: `Gao~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: data.url },
			},
		};

		return content;
	}

	async getNeko() {
		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/neko");

		if (data.code !== 200) {
			return "Error 01: Unable to access the json content of API";
		}

		//REPLACE the chars for sauceNAO
		const chars: any = { "/": "%2F", ":": "%3A" };

		let content = {
			embed: {
				color: "RANDOM",
				title: "Nya nya~",
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: number) => chars[m])})`,
				image: { url: data.url },
			},
		};

		return content;
	}

	async getNekoGif() {
		const { data }: any = await axios.get("https://nekos.life/api/v2/img/ngif");

		const chars: any = { "/": "%2F", ":": "%3A" };

		let content = {
			embed: {
				color: "RANDOM",
				title: `Nya nya~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: data.url },
			},
		};

		return content;
	}

	async getNekoV2() {
		const { data }: any = await axios.get("https://nekos.life/api/v2/img/neko");

		const chars: any = { "/": "%2F", ":": "%3A" };
		let content = {
			embed: {
				color: "RANDOM",
				title: `Nya nya~`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: data.url },
			},
		};

		return content;
	}

	async getWallpaper() {
		const { data }: any = await axios.get("https://nekos.life/api/v2/img/wallpaper");

		const chars: any = { "/": "%2F", ":": "%3A" };
		let content = {
			embed: {
				color: "RANDOM",
				title: `Via Nekos.life`,
				url: `https://nekos.life/`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.url.replace(/[:/]/g, (m: string) => chars[m])})`,
				image: { url: data.url },
			},
		};

		return content;
	}

	async getAnimeImgURL(action: "pat" | "hug" | "waifu" | "cry" | "kiss" | "slap" | "smug" | "punch") {
		let array = ["pat", "hug", "waifu", "cry", "kiss", "slap", "smug", "punch"];

		if (!array.find((x) => x === action.toLowerCase())) {
			return "Unknown Action name, options of action are - " + array.join(", ");
		}

		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/" + action.toLowerCase());

		return data.url;
	}

	async getAnimeImgURLV2(action: "pat" | "hug" | "tickle" | "kiss" | "slap" | "poke" | "cuddle") {
		let array = ["pat", "hug", "tickle", "kiss", "slap", "poke", "cuddle"];

		if (!array.find((x) => x === action.toLowerCase())) {
			return "Unknown Action name, options of action are - " + array.join(", ");
		}

		const { data }: any = await axios.get("https://nekos.life/api/v2/img/" + action.toLowerCase());

		return data.url;
	}

	async getAdvice() {
		const { data }: any = await axios.get("https://api.adviceslip.com/advice");

		return data.slip ? data.slip.advice : false;
	}

	async getShip(chara1: string, chara2: string) {
		const { data }: any = await axios.get("https://apis.beta.duncte123.me/love/" + chara1 + `/` + chara2);

		return data;
	}
}
