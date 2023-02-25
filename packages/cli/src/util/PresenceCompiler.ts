import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, promises as fs } from "node:fs";

import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";

import chalk, { ChalkInstance } from "chalk";
import { watch } from "chokidar";

import { ErrorInfo } from "ts-loader/dist/interfaces";
import ts from "typescript";

import { prefix as utilPrefix } from "./prefix.js";
import ModuleManager from "./ModuleManager.js";
import { OutputTerminal } from "@ext/index";

export default class Compiler {
	private compiler: webpack.Compiler | null = null;
	private watching: webpack.Watching | null = null;
	private output: Console | OutputTerminal = console;

	prefix = utilPrefix + " ";

	public onStart?: () => void;
	public onRecompile?: () => void;

	public firstRun = true;

	constructor(private cwd: string, private options: {
		usePrefix?: boolean;
		terminal?: OutputTerminal;
	} = {}) {
		if (this.options.terminal) this.output = this.options.terminal;
		if (this.options.usePrefix === false) this.prefix = "";

		const moduleManager = new ModuleManager(this.cwd, this.options.terminal);

		watch(this.cwd, { depth: 0, persistent: true, ignoreInitial: true }).on(
			"all",
			async (event, file) => {
				if (["add", "unlink"].includes(event) && basename(file) === "iframe.ts")
					return await this.restart();

				if (basename(file) === "package.json") {
					if (
						["add", "change"].includes(event) &&
						!(await moduleManager.isValidPackageJson())
					)
						return this.output.error(`${this.prefix}${chalk.redBright("Invalid package.json!")}`);

					await this.stop();

					if ("change" === event) await moduleManager.installDependencies();
					else if (event === "unlink") {
						if (existsSync(resolve(this.cwd, "node_modules")))
							fs.rm(resolve(this.cwd, "node_modules"), { recursive: true });
						if (existsSync(resolve(this.cwd, "package-lock.json")))
							fs.rm(resolve(this.cwd, "package-lock.json"));
					}

					this.restart();
				}
			}
		);
	}

	async watch(options: {
		compiler?: string,
		loader?: string,
	} = {}) {
		if (this.onStart) this.onStart();
		this.compiler = webpack({
			mode: "none",
			resolveLoader: {
				modules: [fileURLToPath(new URL("../../node_modules", import.meta.url))]
			},
			devtool: "inline-source-map",
			plugins: [
				new webpack.DynamicEntryPlugin(this.cwd, async () => {
					return new Promise(r => {
						if (existsSync(resolve(this.cwd, "iframe.ts")))
							r({
								"iframe.js": {
									filename: "iframe.js",
									baseUri: this.cwd,
									import: ["./iframe.ts"]
								}
							});
						else r({});
					});
				}),
				new CopyPlugin({
					patterns: [
						{
							from: resolve(this.cwd, "metadata.json"),
							to: "metadata.json"
						}
					]
				}),
				new webpack.WatchIgnorePlugin({
					paths: [/\.js$/, /\.d\.[cm]ts$/]
				}),
				{
					apply(compiler) {
						compiler.hooks.emit.tap("PresenceCompiler", compilation => {
							//* Add empty line after file content to prevent errors from PreMiD
							for (const file in compilation.assets) {
								//* Check if file is a .js file
								if (!file.endsWith(".js")) continue;
								//@ts-expect-error - This is defined. (ConcatSource class)
								compilation.assets[file].add("\n");
							}
						});
					}
				}
			],
			module: {
				rules: [
					{
						test: /\.ts$/,
						loader: options.loader,
						exclude: /node_modules/,
						options: {
							compiler: options.compiler,
							onlyCompileBundledFiles: true,
							errorFormatter: (error: ErrorInfo, colors: ChalkInstance) => {
								return (
									`${this.prefix}${colors.cyan(
										basename(dirname(error.file!)) + "/" + basename(error.file!)
									)}` +
									":" +
									colors.yellowBright(error.line) +
									":" +
									colors.yellowBright(error.character) +
									" - " +
									colors.redBright("Error ") +
									colors.gray("TS" + error.code + ":") +
									" " +
									ts.flattenDiagnosticMessageText(error.content, "\n")
								);
							}
						}
					}
				]
			},
			resolve: {
				extensions: [".ts"]
			},
			entry: async () => {
				const output: Record<string, string> = {
					presence: resolve(this.cwd, "presence.ts")
				};

				return output;
			},
			output: {
				path: resolve(this.cwd, "dist"),
				filename: "[name].js",
				iife: false,
				clean: true
			}
		});

		this.compiler.hooks.compile.tap("pmd", () => {
			if (this.onRecompile) this.onRecompile();
			if (!this.firstRun)
				this.output.log(`${this.prefix}${chalk.yellowBright("Recompiling...")}`);

			this.firstRun = false;
		});

		this.compiler.hooks.afterCompile.tap("pmd", compilation => {
			compilation.errors = compilation.errors.filter(
				e => e.name !== "ModuleBuildError"
			);

			for (const error of compilation.errors) {
				if (
					error.name === "ModuleNotFoundError" &&
					error.message.includes(resolve(this.cwd, "package.json"))
				) {
					this.output.error(`${this.prefix}${chalk.redBright("package.json not valid!")}`);
					continue;
				}

				this.output.error(error.message);
			}

			if (compilation.errors.length === 0) return this.output.log(`${this.prefix}${chalk.greenBright("Successfully compiled!")}`);
			else return this.output.log(`${this.prefix}${chalk.redBright(`Failed to compile with ${compilation.errors.length} error${compilation.errors.length === 1 ? "" : "s"}!`)}`);
		});


		await new Promise(r => (this.watching = this.compiler!.watch({}, r)));
	}

	async stop() {
		this.watching?.suspend();
		if (this.watching) await new Promise(r => this.watching?.close(r));
	}

	async restart() {
		this.firstRun = true;
		await this.stop();
		await this.watch();
	}
}