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

	async getWallpaper() {
		const { data }: any = await axios.get("http://api.nekos.fun:8080/api/wallpapers", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		const replaceChars: any = { "/": "%2F", ":": "%3A" };
		let content = {
			embed: {
				color: "RANDOM",
				title: `Via Nekos.fun`,
				url: `https://nekos.fun/`,
				description: `[SauceNAO](https://saucenao.com/search.php?db=999&url=${data.image.replace(/[:/]/g, (m: string) => replaceChars[m])})`,
				image: { url: data.image },
			},
		};

		return content;
	}

	async getAnimeImgURL(action: "neko" | "kitsune" | "pat" | "hug" | "waifu" | "cry" | "kiss" | "slap" | "smug" | "punch") {
		const { data }: any = await axios.get("https://neko-love.xyz/api/v1/" + action.toLowerCase(), {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data.url;
	}

	async getAnimeImgURLV2(action: "kiss" | "lick" | "hug" | "baka" | "cry" | "poke" | "smug" | "slap" | "tickle" | "pat" | "laugh" | "feed" | "cuddle") {
		const { data }: any = await axios.get("http://api.nekos.fun:8080/api/" + action.toLowerCase(), {
			headers: {
				"Content-Type": "application/json",
			},
		});

		return data.image;
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
