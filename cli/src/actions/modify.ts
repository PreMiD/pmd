import { basename, resolve } from "node:path";
import { createRequire } from "node:module";
import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

import { watch } from "chokidar";
import prompts from "prompts";
import chalk from "chalk";

import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";

import ModuleManager from "../util/ModuleManager.js";
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
	`./websites/${getFolderLetter(service)}/${service}`
);

const moduleManager = new ModuleManager(presencePath);

await moduleManager.installDependencies();

await cp(
	resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"),
	resolve(presencePath, "tsconfig.json")
);

console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
const compiler = new Compiler(presencePath);

watch(presencePath, { depth: 0, persistent: true, ignoreInitial: true }).on(
	"all",
	async (event, file) => {
		if (["add", "unlink"].includes(event) && basename(file) === "iframe.ts")
			return await compiler.restart();

		if (basename(file) === "package.json") {
			if (
				["add", "change"].includes(event) &&
				!(await moduleManager.isValidPackageJson())
			)
				return console.error(prefix, chalk.redBright("Invalid package.json!"));

			await compiler.stop();

			if ("change" === event) await moduleManager.installDependencies();
			else if (event === "unlink") {
				if (existsSync(resolve(presencePath, "node_modules")))
					rm(resolve(presencePath, "node_modules"), { recursive: true });
				if (existsSync(resolve(presencePath, "package-lock.json")))
					rm(resolve(presencePath, "package-lock.json"));
			}

			compiler.restart();
		}
	}
);

compiler.watch({
	loader: require.resolve("ts-loader")
});
