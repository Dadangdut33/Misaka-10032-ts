import { syllable } from "./syllable";
const ntw = require("number-to-words");

export const detect = (msg: string) => {
	return format(msg).length === 3;
};

export const format = (msg: string) => {
	if (msg.length > 300) {
		// Bail out to avoid wrecking the CPU with syllable; I'm happy to bump this number if there's reason
		// Longest 1 syllable word is 12, (12 + 1)*(5+7+5) = 221; 17 longest words spaced out + 30 characters
		return [];
	}

	// Replace numbers with words
	let numbers = msg.match(/(\d+)/g) || [];
	for (let i = 0; i < numbers.length; i++) {
		msg = msg.replace(numbers[i], ntw.toWords(numbers[i]));
	}

	let syllable_count = syllable(msg);
	if (syllable_count > 19 || syllable_count < 17) return [];

	let msg_match = msg.match(/([\w-']+[^\w-']*)/g)!,
		first_part = 0,
		second_part = 0,
		third_part = 0,
		first_part_string = "",
		second_part_string = "",
		third_part_string = "";

	msg_match.forEach((word) => {
		if (first_part < 5) {
			first_part += syllable(word);
			first_part_string = first_part_string.concat(word);
		} else if (second_part < 7) {
			second_part += syllable(word);
			second_part_string = second_part_string.concat(word);
		} else {
			third_part += syllable(word);
			third_part_string = third_part_string.concat(word);
		}
	});

	// results
	if (first_part === 5 && second_part === 7 && third_part === 5) {
		return [first_part_string, second_part_string, third_part_string];
	} else if (first_part === 5 && first_part + second_part + third_part === syllable_count) {
		return [first_part_string, second_part_string, third_part_string];
	} else {
		return [];
	}
};
