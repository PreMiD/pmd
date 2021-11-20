import chalk from "chalk";
import cmdArgs from "command-line-args";
import { Tree } from "displayastree";

import { author, contributors, version } from "..";
import outline from "./outline";

interface config {
	create: boolean;
	modify: boolean;
	bump: boolean;
}

export default function config() {
	let config: config;

	if (process.argv.includes("-h") || process.argv.includes("--help")) {
		new Tree(
			chalk.green(
				`${chalk.bold("PMD")} ${chalk.hex("#bebebe")("(v" + version + ")")}`
			)
		)
			.addBranch([
				chalk.hex("#ebc14d")(`Author: ${chalk.hex("#bebebe")(author)}`),
				chalk.hex("#ebc14d")(
					`Contributor${contributors.length === 1 ? "" : "s"}: ${chalk.hex(
						"#bebebe"
					)(contributors.join(chalk.hex("#ebc14d")(", ")))}`
				)
			])
			.log();
		showAvailableArgs();
		process.exit();
	}

	config = cmdArgs(
		[
			{
				name: "create",
				defaultValue: false,
				alias: "c",
				type: Boolean
			},
			{
				name: "modify",
				defaultValue: false,
				alias: "m",
				type: Boolean
			},
			{ name: "bump", defaultValue: false, alias: "b", type: Boolean }
		],
		{ stopAtFirstUnknown: false, partial: true }
	) as any;

	return config;
}

function showAvailableArgs(): void {
	const configDescriptions: {
		[key in keyof config]: {
			type: string;
			description: string;
			alias?: string;
		};
	} = {
		create: {
			type: "boolean",
			alias: "c",
			description: "Go straight to presence creation"
		},
		modify: {
			type: "boolean",
			alias: "m",
			description: "Go straight to presence modification"
		},
		bump: {
			type: "boolean",
			alias: "b",
			description: "Bump the versions of all presences"
		}
	};
	let settings: string[] = [];
	for (const [k, v] of Object.entries(configDescriptions)) {
		settings.push(
			`${chalk.yellowBright("--" + k)}${
				v.alias ? chalk.italic(" (-" + v.alias + ")") : ""
			} * ${chalk.underline(chalk.hex("#bebebe")(v.type))} • ${chalk.hex(
				"#7289DA"
			)(v.description)}`
		);
	}
	outline(settings, "(");
	outline(settings, "*");
	outline(settings, "•");
	settings = settings.map(c => c.replaceAll("* ", ""));
	new Tree(chalk.bold(chalk.green("Available arguments")))
		.addBranch(settings)
		.log();
}
