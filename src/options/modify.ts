import prompts from "prompts";

import getPresenceNames from "../util/getPresenceNames";

export default async function modify() {
	const presence = await prompts([
		{
			name: "presence",
			message: "Select or search for a Presence",
			initial: "PreMiD",
			type: "autocomplete",
			choices: (await getPresenceNames()).map(p => ({ title: p }))
		}
	]);

	console.log(presence);
}
