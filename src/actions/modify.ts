import chalk from "chalk";
import { cp } from "fs/promises";
import { basename, dirname, resolve } from "path";
import prompts from "prompts";
import ts from "typescript";
import { fileURLToPath } from "url";

import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
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

const formatHost: ts.FormatDiagnosticsHost = {
	getCanonicalFileName: path => path,
	getCurrentDirectory: ts.sys.getCurrentDirectory,
	getNewLine: () => ts.sys.newLine
};

const presencePath = resolve(
	`./websites/${getFolderLetter(service)}/${service}`
);

await cp(
	resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"),
	resolve(presencePath, "tsconfig.json")
);

const configPath = ts.findConfigFile(
	presencePath,
	ts.sys.fileExists,
	"tsconfig.json"
);

if (!configPath) {
	console.error("Could not find a valid 'tsconfig.json'.");
	process.exit(1);
}

const reportWatchStatusChanged: ts.WatchStatusReporter = (
	diagnostic,
	_newLine,
	_options,
	errorCount
) => {
	switch (diagnostic.code) {
		case 6031:
			return console.log(
				prefix,
				chalk.greenBright("Starting TypeScript compiler...")
			);
		case 6194:
			if (errorCount === 0)
				return console.log(prefix, chalk.greenBright("Successfully compiled!"));
			else
				return console.log(
					prefix,
					chalk.redBright(
						`Failed to compile with ${errorCount} error${
							errorCount === 1 ? "" : "s"
						}!`
					)
				);
		case 6032:
			return console.log(prefix, chalk.yellowBright("Recompiling..."));
		case 6193:
			return console.error(
				prefix,
				chalk.redBright(`Failed to compile with 1 error!`)
			);
		default:
			return console.info(ts.formatDiagnostic(diagnostic, formatHost));
	}
};

const reportDiagnostic: ts.DiagnosticReporter = diagnostic => {
	const { character, line } = ts.getLineAndCharacterOfPosition(
		diagnostic.file!,
		diagnostic.start!
	);

	console.error(
		prefix,
		chalk.cyan(
			basename(dirname(diagnostic.file?.fileName!)) +
				"/" +
				basename(diagnostic.file?.fileName!)
		) +
			":" +
			chalk.yellowBright(line + 1) +
			":" +
			chalk.yellowBright(character + 1),
		"-",
		chalk.redBright("Error ") + chalk.gray("TS" + diagnostic.code + ":"),
		ts.flattenDiagnosticMessageText(
			diagnostic.messageText,
			formatHost.getNewLine()
		)
	);
};

const compilerHost = ts.createWatchCompilerHost(
	configPath,
	{},
	ts.sys,
	ts.createEmitAndSemanticDiagnosticsBuilderProgram,
	reportDiagnostic,
	reportWatchStatusChanged
);

ts.createWatchProgram(compilerHost);
