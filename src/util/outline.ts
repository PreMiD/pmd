/**
 * @param stringArray The array of strings you want to outline
 * @param splitter The key of where it needs to outline to
 */
export default function outline(stringArray: string[], splitter: string) {
	let highestLength = 0;
	//* Check if message length is higher then highestLength, if so set.
	stringArray.forEach(message => {
		if (
			message.includes(splitter) &&
			message.split(splitter)[0].length > highestLength
		)
			highestLength = message.split(splitter)[0].length;
	});
	//* Add spaces to the error messages to they match the highestLength.
	stringArray.forEach((message, index) => {
		if (
			message.includes(splitter) &&
			message.split(splitter)[0].length !== highestLength
		) {
			const difference = highestLength - message.split(splitter)[0].length;
			let newMessage = message.split(splitter)[0];
			for (let i = 0; i < difference; i++) {
				newMessage += " ";
			}
			newMessage += splitter + message.split(splitter)[1];
			stringArray[index] = newMessage;
		}
	});
}
