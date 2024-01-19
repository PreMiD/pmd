import chalk from "chalk";
import { existsSync } from "fs";
import { cp, rm } from "fs/promises";
import { basename, dirname, resolve } from "path";
import { Command } from "commander";
import prompts from "prompts";
import ts from "typescript";
import { fileURLToPath } from "url";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import { createRequire } from "module";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
import { prefix } from "../util/prefix.js";
import ModuleManager from "../util/ModuleManager.js";
import { watch } from "chokidar";
const program = new Command();
program
    .allowUnknownOption()
    .option("-m, --modify [presence]")
    .parse(process.argv);
let service = program.getOptionValue("modify")?.trim();
if (typeof service !== "string") {
    service = (await prompts({
        name: "service",
        message: "Select or search for a presence to modify",
        type: "autocomplete",
        choices: (await getPresences()).map((s) => ({
            title: s.service,
            description: "v" + s.version,
            value: s.service,
        })),
    })).service?.trim();
    if (!service)
        process.exit(0);
}
else {
    if (!(await getPresences())
        .map((s) => ({
        title: s.service,
    }))
        .find((p) => p.title.toLowerCase() === service.replace("!", " ").trim().toLowerCase())) {
        console.log(prefix, chalk.redBright("Could not find presence:", service));
        process.exit(0);
    }
}
const require = createRequire(import.meta.url);
const presencePath = resolve(`./websites/${getFolderLetter(service)}/${service.replace("!", " ").trim()}`);
const moduleManager = new ModuleManager(presencePath);
await moduleManager.installDependencies();
if (!existsSync(resolve(presencePath, "tsconfig.json")))
    await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
class Compiler {
    cwd;
    compiler = null;
    watching = null;
    firstRun = true;
    constructor(cwd) {
        this.cwd = cwd;
    }
    async watch() {
        this.compiler = webpack({
            mode: "none",
            resolveLoader: {
                modules: [
                    fileURLToPath(new URL("../../node_modules", import.meta.url)),
                ],
            },
            devtool: "inline-source-map",
            plugins: [
                new webpack.DynamicEntryPlugin(this.cwd, async () => {
                    return new Promise((r) => {
                        if (existsSync(resolve(this.cwd, "iframe.ts")))
                            r({
                                "iframe.js": {
                                    filename: "iframe.js",
                                    baseUri: this.cwd,
                                    import: ["./iframe.ts"],
                                },
                            });
                        else
                            r({});
                    });
                }),
                new CopyPlugin({
                    patterns: [
                        {
                            from: resolve(this.cwd, "metadata.json"),
                            to: "metadata.json",
                        },
                    ],
                }),
                new webpack.WatchIgnorePlugin({
                    paths: [/\.js$/, /\.d\.[cm]ts$/],
                }),
                {
                    apply(compiler) {
                        compiler.hooks.emit.tap("PresenceCompiler", (compilation) => {
                            for (const file in compilation.assets) {
                                if (!file.endsWith(".js"))
                                    continue;
                                compilation.assets[file].add("\n");
                            }
                        });
                    },
                },
            ],
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: require.resolve("ts-loader"),
                        exclude: /node_modules/,
                        options: {
                            onlyCompileBundledFiles: true,
                            errorFormatter: (error, colors) => {
                                return (`${prefix} ${colors.cyan(basename(dirname(error.file)) + "/" + basename(error.file))}` +
                                    ":" +
                                    colors.yellowBright(error.line) +
                                    ":" +
                                    colors.yellowBright(error.character) +
                                    " - " +
                                    colors.redBright("Error ") +
                                    colors.gray("TS" + error.code + ":") +
                                    " " +
                                    ts.flattenDiagnosticMessageText(error.content, "\n"));
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: [".ts"],
            },
            entry: async () => {
                const output = {
                    presence: resolve(this.cwd, "presence.ts"),
                };
                return output;
            },
            output: {
                path: resolve(this.cwd, "dist"),
                filename: "[name].js",
                iife: false,
                clean: true,
            },
        });
        this.compiler.hooks.compile.tap("pmd", () => {
            if (!this.firstRun)
                console.log(prefix, chalk.yellowBright("Recompiling..."));
            this.firstRun = false;
        });
        this.compiler.hooks.afterCompile.tap("pmd", (compilation) => {
            compilation.errors = compilation.errors.filter((e) => e.name !== "ModuleBuildError");
            for (const error of compilation.errors) {
                if (error.name === "ModuleNotFoundError" &&
                    error.message.includes(resolve(this.cwd, "package.json"))) {
                    console.error(prefix, chalk.redBright("package.json not valid!"));
                    continue;
                }
                console.error(error.message);
            }
            if (compilation.errors.length === 0)
                return console.log(prefix, chalk.greenBright("Successfully compiled!"));
            else
                return console.log(prefix, chalk.redBright(`Failed to compile with ${compilation.errors.length} error${compilation.errors.length === 1 ? "" : "s"}!`));
        });
        await new Promise((r) => (this.watching = this.compiler.watch({}, r)));
    }
    async stop() {
        this.watching?.suspend();
        if (this.watching)
            await new Promise((r) => this.watching?.close(r));
    }
    async restart() {
        this.firstRun = true;
        await this.stop();
        await this.watch();
    }
}
const compiler = new Compiler(presencePath);
watch(presencePath, { depth: 0, persistent: true, ignoreInitial: true }).on("all", async (event, file) => {
    if (["add", "unlink"].includes(event) && basename(file) === "iframe.ts")
        return await compiler.restart();
    if (basename(file) === "package.json") {
        if (["add", "change"].includes(event) &&
            !(await moduleManager.isValidPackageJson()))
            return console.error(prefix, chalk.redBright("Invalid package.json!"));
        await compiler.stop();
        if ("change" === event)
            await moduleManager.installDependencies();
        else if (event === "unlink") {
            if (existsSync(resolve(presencePath, "node_modules")))
                rm(resolve(presencePath, "node_modules"), { recursive: true });
            if (existsSync(resolve(presencePath, "package-lock.json")))
                rm(resolve(presencePath, "package-lock.json"));
        }
        compiler.restart();
    }
});
compiler.watch();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBd0IsTUFBTSxPQUFPLENBQUM7QUFDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLElBQUksQ0FBQztBQUNoQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDcEMsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBQzlCLE9BQU8sVUFBVSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdkMsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxZQUFZLE1BQU0sOEJBQThCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTNDLE9BQU8sYUFBYSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFakMsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM5QixPQUFPO0tBQ0osa0JBQWtCLEVBQUU7S0FDcEIsTUFBTSxDQUFDLHlCQUF5QixDQUFDO0tBQ2pDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFdkIsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNB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