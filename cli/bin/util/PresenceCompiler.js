import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import webpack from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import chalk from "chalk";
import ts from "typescript";
import { prefix as utilPrefix } from "./prefix";
export default class Compiler {
    cwd;
    options;
    compiler = null;
    watching = null;
    output = console;
    prefix = utilPrefix;
    onStart;
    onRecompile;
    firstRun = true;
    constructor(cwd, options = {}) {
        this.cwd = cwd;
        this.options = options;
        if (this.options.terminal)
            this.output = this.options.terminal;
        if (this.options.usePrefix === false)
            this.prefix = "";
    }
    async watch(options = {}) {
        if (this.onStart)
            this.onStart();
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
                        loader: options.loader,
                        exclude: /node_modules/,
                        options: {
                            compiler: options.compiler,
                            onlyCompileBundledFiles: true,
                            errorFormatter: (error, colors) => {
                                return (`${this.prefix}${colors.cyan(basename(dirname(error.file)) + "/" + basename(error.file))}` +
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
            if (this.onRecompile)
                this.onRecompile();
            if (!this.firstRun)
                this.output.log(`${this.prefix}${chalk.yellowBright("Recompiling...")}`);
            this.firstRun = false;
        });
        this.compiler.hooks.afterCompile.tap("pmd", compilation => {
            compilation.errors = compilation.errors.filter(e => e.name !== "ModuleBuildError");
            for (const error of compilation.errors) {
                if (error.name === "ModuleNotFoundError" &&
                    error.message.includes(resolve(this.cwd, "package.json"))) {
                    this.output.error(`${this.prefix}${chalk.redBright("package.json not valid!")}`);
                    continue;
                }
                this.output.error(error.message);
            }
            if (compilation.errors.length === 0)
                return this.output.log(`${this.prefix}${chalk.greenBright("Successfully compiled!")}`);
            else
                return this.output.log(`${this.prefix}${chalk.redBright(`Failed to compile with ${compilation.errors.length} error${compilation.errors.length === 1 ? "" : "s"}!`)}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJlc2VuY2VDb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL1ByZXNlbmNlQ29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVyQyxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxLQUF3QixNQUFNLE9BQU8sQ0FBQztBQUc3QyxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFNUIsT0FBTyxFQUFFLE1BQU0sSUFBSSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHaEQsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFRO0lBWVI7SUFBcUI7SUFYakMsUUFBUSxHQUE0QixJQUFJLENBQUM7SUFDekMsUUFBUSxHQUE0QixJQUFJLENBQUM7SUFDekMsTUFBTSxHQUE2QixPQUFPLENBQUM7SUFFbkQsTUFBTSxHQUFHLFVBQVUsQ0FBQztJQUViLE9BQU8sQ0FBYztJQUNyQixXQUFXLENBQWM7SUFFekIsUUFBUSxHQUFHLElBQUksQ0FBQztJQUV2QixZQUFvQixHQUFXLEVBQVUsVUFHckMsRUFBRTtRQUhjLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUcxQztRQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRO1lBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUMvRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLEtBQUs7WUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUdSLEVBQUU7UUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPO1lBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLElBQUksRUFBRSxNQUFNO1lBQ1osYUFBYSxFQUFFO2dCQUNkLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDeEU7WUFDRCxPQUFPLEVBQUUsbUJBQW1CO1lBQzVCLE9BQU8sRUFBRTtnQkFDUixJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0QixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQzs0QkFDN0MsQ0FBQyxDQUFDO2dDQUNELFdBQVcsRUFBRTtvQ0FDWixRQUFRLEVBQUUsV0FBVztvQ0FDckIsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHO29DQUNqQixNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUM7aUNBQ3ZCOzZCQUNELENBQUMsQ0FBQzs7NEJBQ0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNaLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQztnQkFDRixJQUFJLFVBQVUsQ0FBQztvQkFDZCxRQUFRLEVBQUU7d0JBQ1Q7NEJBQ0MsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQzs0QkFDeEMsRUFBRSxFQUFFLGVBQWU7eUJBQ25CO3FCQUNEO2lCQUNELENBQUM7Z0JBQ0YsSUFBSSxPQUFPLENBQUMsaUJBQWlCLENBQUM7b0JBQzdCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUM7aUJBQ2hDLENBQUM7Z0JBQ0Y7b0JBQ0MsS0FBSyxDQUFDLFFBQVE7d0JBQ2IsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQyxFQUFFOzRCQUV6RCxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0NBRXRDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztvQ0FBRSxTQUFTO2dDQUVwQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs2QkFDbkM7d0JBQ0YsQ0FBQyxDQUFDLENBQUM7b0JBQ0osQ0FBQztpQkFDRDthQUNEO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLEtBQUssRUFBRTtvQkFDTjt3QkFDQyxJQUFJLEVBQUUsT0FBTzt3QkFDYixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07d0JBQ3RCLE9BQU8sRUFBRSxjQUFjO3dCQUN2QixPQUFPLEVBQUU7NEJBQ1IsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFROzRCQUMxQix1QkFBdUIsRUFBRSxJQUFJOzRCQUM3QixjQUFjLEVBQUUsQ0FBQyxLQUFnQixFQUFFLE1BQXFCLEVBQUUsRUFBRTtnQ0FDM0QsT0FBTyxDQUNOLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUM1RCxFQUFFO29DQUNILEdBQUc7b0NBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29DQUMvQixHQUFHO29DQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQ0FDcEMsS0FBSztvQ0FDTCxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztvQ0FDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7b0NBQ3BDLEdBQUc7b0NBQ0gsRUFBRSxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQ3BELENBQUM7NEJBQ0gsQ0FBQzt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1lBQ0QsT0FBTyxFQUFFO2dCQUNSLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQzthQUNuQjtZQUNELEtBQUssRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDakIsTUFBTSxNQUFNLEdBQTJCO29CQUN0QyxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDO2lCQUMxQyxDQUFDO2dCQUVGLE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQztZQUNELE1BQU0sRUFBRTtnQkFDUCxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDO2dCQUMvQixRQUFRLEVBQUUsV0FBVztnQkFDckIsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsS0FBSyxFQUFFLElBQUk7YUFDWDtTQUNELENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtZQUMzQyxJQUFJLElBQUksQ0FBQyxXQUFXO2dCQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTFFLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDekQsV0FBVyxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FDN0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGtCQUFrQixDQUNsQyxDQUFDO1lBRUYsS0FBSyxNQUFNLEtBQUssSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUN2QyxJQUNDLEtBQUssQ0FBQyxJQUFJLEtBQUsscUJBQXFCO29CQUNwQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUN4RDtvQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakYsU0FBUztpQkFDVDtnQkFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakM7WUFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7Z0JBQ3ZILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsMEJBQTBCLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxTQUFTLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1SyxDQUFDLENBQUMsQ0FBQztRQUdILE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDVCxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUksSUFBSSxDQUFDLFFBQVE7WUFBRSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDWixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsQixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixDQUFDO0NBQ0QifQ==