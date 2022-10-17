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
                })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBd0IsTUFBTSxPQUFPLENBQUM7QUFDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLElBQUksQ0FBQztBQUNoQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBQzlCLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM1QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3BDLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLFVBQVUsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QyxPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM5RCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsT0FBTyxhQUFhLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVqQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUM7SUFDakMsSUFBSSxFQUFFLFNBQVM7SUFDZixPQUFPLEVBQUUsMkNBQTJDO0lBQ3BELElBQUksRUFBRSxjQUFjO0lBQ3BCLE9BQU8sRUFBRSxDQUNSLE1BQU0sWUFBWSxFQUFFLENBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztRQUNoQixXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPO1FBQzVCLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztLQUNoQixDQUFDLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsT0FBTztJQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFOUIsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUMzQixjQUFjLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FDbkQsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRXRELE1BQU0sYUFBYSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFFMUMsTUFBTSxFQUFFLENBQ1AsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLEVBQzFFLE9BQU8sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQ3RDLENBQUM7QUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxNQUFNLFFBQVE7SUFLTztJQUpaLFFBQVEsR0FBNEIsSUFBSSxDQUFDO0lBQ3pDLFFBQVEsR0FBNEIsSUFBSSxDQUFDO0lBQzFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFFdkIsWUFBb0IsR0FBVztRQUFYLFFBQUcsR0FBSCxHQUFHLENBQVE7SUFBRyxDQUFDO0lBRW5DLEtBQUssQ0FBQyxLQUFLO1FBQ1YsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxFQUFFLE1BQU07WUFDWixhQUFhLEVBQUU7Z0JBQ2QsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksR0FBRyxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUN4RTtZQUNELE9BQU8sRUFBRSxtQkFBbUI7WUFDNUIsT0FBTyxFQUFFO2dCQUNSLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ3RCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDOzRCQUM3QyxDQUFDLENBQUM7Z0NBQ0QsV0FBVyxFQUFFO29DQUNaLFFBQVEsRUFBRSxXQUFXO29DQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUc7b0NBQ2pCLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQztpQ0FDdkI7NkJBQ0QsQ0FBQyxDQUFDOzs0QkFDQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ1osQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDO2dCQUNGLElBQUksVUFBVSxDQUFDO29CQUNkLFFBQVEsRUFBRTt3QkFDVDs0QkFDQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDOzRCQUN4QyxFQUFFLEVBQUUsZUFBZTt5QkFDbkI7cUJBQ0Q7aUJBQ0QsQ0FBQztnQkFDRixJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztvQkFDN0IsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQztpQkFDaEMsQ0FBQzthQUNGO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLEtBQUssRUFBRTtvQkFDTjt3QkFDQyxJQUFJLEVBQUUsT0FBTzt3QkFDYixNQUFNLEVBQUUsV0FBVzt3QkFDbkIsT0FBTyxFQUFFLGNBQWM7d0JBQ3ZCLE9BQU8sRUFBRTs0QkFDUix1QkFBdUIsRUFBRSxJQUFJOzRCQUM3QixjQUFjLEVBQUUsQ0FBQyxLQUFnQixFQUFFLE1BQXFCLEVBQUUsRUFBRTtnQ0FDM0QsT0FBTyxDQUNOLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQ3ZCLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFDLENBQzVELEVBQUU7b0NBQ0gsR0FBRztvQ0FDSCxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7b0NBQy9CLEdBQUc7b0NBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO29DQUNwQyxLQUFLO29DQUNMLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO29DQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztvQ0FDcEMsR0FBRztvQ0FDSCxFQUFFLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FDcEQsQ0FBQzs0QkFDSCxDQUFDO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0Q7WUFDRCxPQUFPLEVBQUU7Z0JBQ1IsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDO2FBQ25CO1lBQ0QsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNqQixNQUFNLE1BQU0sR0FBMkI7b0JBQ3RDLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUM7aUJBQzFDLENBQUM7Z0JBRUYsT0FBTyxNQUFNLENBQUM7WUFDZixDQUFDO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7Z0JBQy9CLFFBQVEsRUFBRSxXQUFXO2dCQUNyQixJQUFJLEVBQUUsS0FBSztnQkFDWCxLQUFLLEVBQUUsSUFBSTthQUNYO1NBQ0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFFM0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsRUFBRTtZQUN6RCxXQUFXLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUM3QyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQ2xDLENBQUM7WUFFRixLQUFLLE1BQU0sS0FBSyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZDLElBQ0MsS0FBSyxDQUFDLElBQUksS0FBSyxxQkFBcUI7b0JBQ3BDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQ3hEO29CQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxTQUFTO2lCQUNUO2dCQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdCO1lBRUQsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNsQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDOztnQkFFeEUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUNqQixNQUFNLEVBQ04sS0FBSyxDQUFDLFNBQVMsQ0FDZCwwQkFBMEIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLFNBQ2xELFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUN4QyxHQUFHLENBQ0gsQ0FDRCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJO1FBQ1QsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN6QixJQUFJLElBQUksQ0FBQyxRQUFRO1lBQUUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPO1FBQ1osSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsQ0FBQztDQUNEO0FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFNUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQzFFLEtBQUssRUFDTCxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQ3JCLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXO1FBQ3RFLE9BQU8sTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7SUFFakMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssY0FBYyxFQUFFO1FBQ3RDLElBQ0MsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUNqQyxDQUFDLENBQUMsTUFBTSxhQUFhLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUUzQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBRXhFLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXRCLElBQUksUUFBUSxLQUFLLEtBQUs7WUFBRSxNQUFNLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQzdELElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUM1QixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNwRCxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQkFDekQsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0FBQ0YsQ0FBQyxDQUNELENBQUM7QUFFRixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMifQ==