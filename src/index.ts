#!/usr/bin/env node
import "source-map-support/register.js";

import chalk from "chalk";
import { readFile } from "fs/promises";
import inquirer from "inquirer";
import ora from "ora";

import getDiscordAppUser from "./functions/getDiscordAppUser.js";
import { prefix } from "./util/prefix.js";

if (!(await inPresenceRepo())) {
	console.error(
		prefix,
		chalk.redBright("This command can only be run in the presence repository")
	);
	process.exit(1);
}

const spinner = ora("Fetching Discord User...").start(),
	user = await getDiscordAppUser();
spinner.stop();

if (user) console.log(prefix, `Hello ${chalk.green(user.username)}!`);

const { action } = await inquirer.prompt<{ action: number }>([
	{
		type: "list",
		name: "action",
		message: "What do you want to do?",
		choices: [
			{
				name: "Create a new Presence",
				value: 0
			},
			{
				name: "Modify an existing Presence",
				value: 1
			},
			{
				name: "Translate a Presence",
				value: 2
			}
		]
	}
]);

switch (action) {
	case 0:
		await import("./actions/create.js");
		break;
	case 1:
		await import("./actions/modify.js");
		break;
	case 2:
		await import("./actions/translate.js");
		break;
}

async function inPresenceRepo() {
	try {
		const { name } = JSON.parse(await readFile("./package.json", "utf8"));
		return name === "presences";
	} catch {
		return false;
	}
}
