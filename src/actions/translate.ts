import { gql } from "@apollo/client/core/index.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { getLanguage } from "language-flag-colors";
import ora from "ora";
import prompts from "prompts";

import getPresences from "../functions/getPresences.js";
import { apollo } from "../util/apollo.js";

const spinner = ora("Loading languages...").start();

const {
	data: { langFiles }
} = await apollo.query<{ langFiles: { lang: string }[] }>({
	query: gql`
		query {
			langFiles(project: "website") {
				lang
			}
		}
	`
});

spinner.stop();

const { lang } = await prompts({
	name: "lang",
	message: "Select the language you want add translations for",
	type: "autocomplete",
	choices: langFiles.map(l => ({
		title: getLanguage(l.lang.replace("_", "-"))?.nativeName ?? l.lang,
		description: l.lang,
		value: l.lang
	})),
	suggest: async (input, choices) => {
		const regex = new RegExp(input, "i");
		return choices.filter(
			c =>
				regex.test(c.title) ||
				(c.description ? regex.test(c.description) : false)
		);
	}
});

const presences = await getPresences();

const { mode, selPresences } = await prompts([
	{
		type: "select",
		name: "mode",
		message: "What do you want to do?",
		choices: [
			{
				title: "Translate every Presence in order",
				value: 0
			},
			{
				title: "Translate every Presence of category",
				value: 1
			},
			{
				title: "Translate selected Presences",
				value: 2
			}
		]
	},
	{
		type: prev => (prev === 2 ? "autocompleteMultiselect" : false),
		name: "selPresences",
		message: "Select the Presences you want to translate",
		instructions: "Use arrow keys to select and space to toggle",
		choices: presences.map(p => ({
			title: p.service,
			value: p
		})),
		min: 1
	}
]);

if (mode === 2) {
	for (const presence of selPresences) {
		const desc = presence.description?.[lang];

		console.log(
			`${
				desc ? chalk.green(desc) + "\n\n" : ""
			}Type "skip" to skip or "stop" to stop translating.`
		);
		await inquirer.prompt({
			type: "editor",
			name: "translation",
			message: presence.service,
			default: desc
		});
	}
}
