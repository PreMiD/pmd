import chalk from "chalk";
import { existsSync } from "fs";
import { cp, rm } from "fs/promises";
import { basename, dirname, resolve } from "path";
import prompts from "prompts";
import ts from "typescript";
import { fileURLToPath } from "url";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
import { prefix } from "../util/prefix.js";
import ModuleManager from "../util/ModuleManager.js";
import { watch } from "chokidar";
const { service } = await prompts({
    name: "service",
    message: "Select or search for a presence to modify",
    type: "autocomplete",
    choices: (await getPresences()).map(s => ({
        title: s.service,
        description: "v" + s.version,
        value: s.service
    }))
});
if (!service)
    process.exit(0);
const presencePath = resolve(`./websites/${getFolderLetter(service)}/${service}`);
const moduleManager = new ModuleManager(presencePath);
await moduleManager.installDependencies();
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
                        else
                            r({});
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
                            for (const file in compilation.assets) {
                                if (!file.endsWith(".js"))
                                    continue;
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
                        loader: "ts-loader",
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
                            }
                        }
                    }
                ]
            },
            resolve: {
                extensions: [".ts"]
            },
            entry: async () => {
                const output = {
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
            if (!this.firstRun)
                console.log(prefix, chalk.yellowBright("Recompiling..."));
            this.firstRun = false;
        });
        this.compiler.hooks.afterCompile.tap("pmd", compilation => {
            compilation.errors = compilation.errors.filter(e => e.name !== "ModuleBuildError");
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
        await new Promise(r => (this.watching = this.compiler.watch({}, r)));
    }
    async stop() {
        this.watching?.suspend();
        if (this.watching)
            await new Promise(r => this.watching?.close(r));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBd0IsTUFBTSxPQUFPLENBQUM7QUFDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLElBQUksQ0FBQztBQUNoQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBQzlCLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM1QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3BDLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLFVBQVUsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QyxPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM5RCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsT0FBTyxhQUFhLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVqQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUM7SUFDakMsSUFBSSxFQUFFLFNBQVM7SUFDZixPQUFPLEVBQUUsMkNBQTJDO0lBQ3BELElBQUksRUFBRSxjQUFjO0lBQ3BCLE9BQU8sRUFBRSxDQUNSLE1BQU0sWUFBWSxFQUFFLENBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztRQUNoQixXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMs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