#!/usr/bin/env node
import "source-map-support/register";

import chalk from "chalk";
import prompts from "prompts";

import bump from "./options/bump";
import create from "./options/create";
import modify from "./options/modify";
import cfg from "./util/configHandler";

export const {
		name,
		version,
		author,
		contributors
	}: {
		name: string;
		description: string;
		version: string;
		author: string;
		contributors: string[];
	} = require("../package.json"),
	config = cfg();

async function run() {
	console.log(
		chalk.green(
			`Launching ${chalk.bold(name)} ${chalk.hex("#bebebe")(
				"(v" + version + ")"
			)}…`
		)
	);

	if (config.create) return create();
	if (config.modify) return modify();
	if (config.bump) return bump();

	const mainPrompt = await prompts([
		{
			name: "main",
			message: "Select an option",
			hint: "Use arrow-keys. Press enter to submit.",
			type: "select",
			choices: [
				{
					title: "Create Presence",
					description: "Creates a new Presence."
				},
				{
					title: "Modify Presence",
					description: "Modify an existing Presence."
				}
			]
		}
	]);

	if (mainPrompt.main === 0) return create();
	else return modify();
}

run();

/*

pmd -c
pmd -d

question?
create new
- input name

select
- dev
- build

*/
