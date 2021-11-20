import { readdir } from "fs/promises";
import { resolve } from "path";

export default async function getPresenceNames() {
	const folders = (
		await Promise.all(
			(await readdir("./websites")).map(f => readdir(resolve("./websites", f)))
		)
	).flat();

	return folders;
}
