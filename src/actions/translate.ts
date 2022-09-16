import { gql } from "@apollo/client/core/index.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { getLanguage } from "language-flag-colors";
import ora from "ora";
import prompts from "prompts";

import fetchSchema from "../functions/fetchSchema.js";
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

const schema = await fetchSchema();

spinner.stop();

const { lang } = await prompts({
	name: "lang",
	message: "Select the language you want add translations for",
	type: "autocomplete",
	choices: langFiles
		.filter(l => l.lang !== "en")
		.map(l => ({
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

let presences = await getPresences();

const { mode } = await prompts([
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
	}
]);

const { selPresences, category } = await prompts([
	{
		type: mode === 2 ? "autocompleteMultiselect" : false,
		name: "selPresences",
		message: "Select the Presences you want to translate",
		instructions: "Use arrow keys to select and space to toggle",
		choices: presences.map(p => ({
			title: p.service,
			value: p
		})),
		min: 1
	},
	{
		type: "list",
		name: "category",
		message: "Category of the service",
		choices: schema.properties.category.enum
	}
]);

if (mode === 2) {
	await translatePresences(selPresences);

	process.exit(0);
}

const { filterPresences } = await prompts([
	{
		type: "confirm",
		name: "filterPresences",
		message: "Filter out already translated Presences?"
	}
]);

if (filterPresences) presences = presences.filter(p => !p.description?.[lang]);
if (category) presences = presences.filter(p => p.category === category);

await translatePresences(presences);

process.exit(0);

async function translatePresences(presences: any) {
	for (const presence of presences) {
		const desc = presence.description?.[lang];

		console.log(
			`${
				desc ? chalk.green(desc) + "\n\n" : ""
			}Type "skip" to skip or "stop" to stop translating.`
		);
		const { translation } = await inquirer.prompt({
			type: "input",
			name: "translation",
			message: presence.service,
			default: desc
		});

		if (translation === "skip" || translation === desc) continue;
		if (translation === "stop") break;
	}
}
