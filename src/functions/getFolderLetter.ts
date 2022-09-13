export default function getFolderLetter(service: string) {
	const firstLetter = service.at(0)!.toUpperCase();

	if (firstLetter.match(/[A-Za-z0-9]/)) return firstLetter;

	return "#";
}
