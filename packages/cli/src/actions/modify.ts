import { resolve } from "node:path";
import { createRequire } from "node:module";
import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import prompts from "prompts";
import chalk from "chalk";

import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";

import Compiler from "../util/PresenceCompiler.js";
import { prefix } from "../util/prefix.js";

const { service } = await prompts({
	name: "service",
	message: "Select or search for a presence to modify",
	type: "autocomplete",
	choices: (
		await getPresences()
	).map(s => ({
		title: s.service,
		description: "v" + s.version,
		value: s.service
	}))
});

if (!service) process.exit(0);

const require = createRequire(import.meta.url);
const presencePath = resolve(
	`./websites/${getFolderLetter(service)}/${service.replace("!", " ")}`
);

await cp(
	resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"),
	resolve(presencePath, "tsconfig.json")
);

console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
const compiler = new Compiler(presencePath);

compiler.watch({
	loader: require.resolve("ts-loader")
});
