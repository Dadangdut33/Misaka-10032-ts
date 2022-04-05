export function capitalizeFirstLetter(myString: string) {
	return myString.charAt(0).toUpperCase() + myString.slice(1);
}

export function hasNumber(myString: string) {
	return /\d/.test(myString);
}

export function reverseString(str: string) {
	return str.split("").reverse().join("");
}
