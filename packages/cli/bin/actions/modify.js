import chalk from "chalk";
import { existsSync, readFileSync, readdirSync } from "fs";
import { cp, rm } from "fs/promises";
import { basename, dirname, extname, resolve } from "path";
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
import socket from "../util/socket.js";
const program = new Command();
program
    .allowUnknownOption()
    .option("-m, --modify [presence]")
    .parse(process.argv);
let service = program.getOptionValue("modify");
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
    })).service;
    if (!service)
        process.exit(0);
    service = service.trim();
}
else {
    service = service.trim();
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
            if (compilation.errors.length === 0) {
                console.log(prefix, chalk.greenBright("Successfully compiled!"));
                const path = presencePath + "/dist";
                sendPresenceToExtension(path);
                return;
            }
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
let waiting = false;
async function sendPresenceToExtension(path) {
    if (!existsSync(path) || !socket.isConnected()) {
        if (waiting)
            return;
        waiting = true;
        setTimeout(() => {
            waiting = false;
            sendPresenceToExtension(path);
        }, 1000);
        return;
    }
    socket?.send(JSON.stringify({
        type: "localPresence",
        files: await Promise.all(readdirSync(path).map((f) => {
            if (extname(f) === ".json")
                return {
                    file: f,
                    contents: JSON.parse(readFileSync(`${path}/${f}`).toString()),
                };
            else if (extname(f) === ".js")
                return {
                    file: f,
                    contents: readFileSync(`${path}/${f}`).toString(),
                };
            else
                return;
        })),
    }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBd0IsTUFBTSxPQUFPLENBQUM7QUFDN0MsT0FBTyxFQUFZLFVBQVUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDM0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDcEMsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBQzlCLE9BQU8sVUFBVSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdkMsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxZQUFZLE1BQU0sOEJBQThCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTNDLE9BQU8sYUFBYSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDakMsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUM7QUFFdkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM5QixPQUFPO0tBQ0osa0JBQWtCLEVBQUU7S0FDcEIsTUFBTSxDQUFDLHlCQUF5QixDQUFDO0tBQ2pDLEtBQUss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