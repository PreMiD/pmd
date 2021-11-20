import chalk from "chalk";
import { Tree } from "displayastree";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { sync as glob } from "glob";
import { coerce, inc, valid } from "semver";

import outline from "../util/outline";

export default async function bump() {
	const missingMetadata: string[] = glob("./{websites,programs}/*/*/")
			.filter(pF => !existsSync(`${pF}/dist/metadata.json`))
			.map(c => c.match(/.\/(websites|programs)\/.*\/(.*)\//)?.[2] ?? ""),
		invalidMetadata: string[] = [],
		allmeta: ([Metadata, string] | null)[] = glob(
			"./{websites,programs}/*/*/*/metadata.json"
		).map(pF => {
			const file = readFileSync(pF, { encoding: "utf8" });
			if (isValidJSON(file)) return [JSON.parse(file) as Metadata, pF];
			else {
				invalidMetadata.push(
					pF.match(/.\/(websites|programs)\/.*\/(.*)\//)?.[2] ?? ""
				);
				return null;
			}
		});

	if (missingMetadata.length || invalidMetadata.length) {
		const invalids: string[] = missingMetadata
			.map(
				c =>
					`${chalk.yellowBright(c)} • ${chalk.hex("#7289DA")(
						"Missing metadata file"
					)}`
			)
			.concat(
				invalidMetadata.map(
					c =>
						`${chalk.yellowBright(c)} • ${chalk.hex("#7289DA")(
							"Invalid metadata file"
						)}`
				)
			)
			.sort();

		outline(invalids, "•");

		new Tree(
			chalk.redBright(
				missingMetadata.length + invalidMetadata.length > 1
					? "Invalid Presences"
					: "Invalid Presence"
			)
		)
			.addBranch(invalids)
			.log();
	}

	let count = 0;
	for (const metadata of allmeta) {
		if (metadata) {
			const newData = metadata[0];
			if (newData.version && valid(coerce(newData.version))) {
				newData.version = inc(valid(coerce(newData.version))!, "patch")!;
				write(metadata[1], newData);
				count++;
			} else {
				try {
					newData.version = "1.0.0";
					write(metadata[1], newData);
					count++;
				} catch (err) {
					chalk.redBright(
						`Error. ${
							metadata[0].service && metadata[0].service.length > 0
								? metadata[0].service
								: metadata[1]
						} didn't have a version in the metadata file, and pmd wasn't able to set it either...\n`
					);
					continue;
				}
			}
		}
	}

	if (count > 0)
		console.log(chalk.green(`Bumped ${chalk.bold(count)} presences!`));
}

interface Metadata {
	service: string;
	version: string;
}

function isValidJSON(text: string): boolean {
	try {
		JSON.parse(text);
		return true;
	} catch {
		return false;
	}
}

function write(path: string, code: Metadata): void {
	writeFileSync(path, JSON.stringify(code, null, 2), {
		encoding: "utf8",
		flag: "w"
	});
}
