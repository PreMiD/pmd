import { commands, ExtensionContext, window } from "vscode";
import { getFolderLetter } from "@pmd/cli";
import { basename, dirname, resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
import chalk from "chalk";
import { rm, writeFile } from "fs/promises";
import { watch } from "chokidar";
import { existsSync } from "fs";
import webpack from "webpack";

import { ErrorInfo } from "ts-loader/dist/interfaces.js";

import OutputTerminal from "../util/OutputTerminal.js";
import fetchTemplate from "../functions/fetchTemplate.js";
import getPresences from "../functions/getPresences";
import { workspaceFolder } from "../extension.js";

import { ModuleManager } from "@pmd/cli";

export default async function modifyPresence(context: ExtensionContext, retry = false): Promise<any> {
  if (!isTypescriptInstalled()) {
    return window.showErrorMessage(
      "You need to have TypeScript locally installed to use this command."
    );
  }

  const loadingStatus = window.setStatusBarMessage(
    "$(loading~spin) Loading the Presences..."
  );

  const presences: { service: string, url: string | string[] }[] = await getPresences();
  loadingStatus.dispose();

  // Sometimes it just fails to load the presences
  if (!presences.length && !retry) {
    window.setStatusBarMessage(
      "$(error) Failed to load the Presences. Trying again...",
      1000
    );
    return modifyPresence(context, true);
  } else if (!presences.length) {
    return window.showErrorMessage(
      "Failed to load the Presences."
    );
  }

  const service = (
    await window.showQuickPick(
      presences.map(({ service, url }) => ({ label: service, detail: Array.isArray(url) ? url[0] : url })),
      {
        title: "Select a presence to modify",
        ignoreFocusOut: true,
        matchOnDetail: true
      }
    )
  )?.label;

  if (!service) return;

  const presencePath = resolve(
    `${workspaceFolder}/websites/${getFolderLetter(service)}/${service}`
  );

  const terminal = new OutputTerminal();
  const moduleManager = new ModuleManager(presencePath, terminal);
  await moduleManager.installDependencies();

  await writeFile(
    resolve(presencePath, "tsconfig.json"),
    JSON.stringify(await fetchTemplate("tsconfig.json"), null, 2)
  );

  const status = window.createStatusBarItem();
  status.text = "$(loading~spin) Starting TypeScript compiler...";
  status.command = "presenceCompiler.stopCompiler";
  status.show();

  terminal.show();
  terminal.appendLine(chalk.greenBright("Starting TypeScript compiler..."));

  class Compiler {
    private compiler: webpack.Compiler | null = null;
    private watching: webpack.Watching | null = null;
    public firstRun = true;

    constructor(private cwd: string) { }

    async watch() {
      status.text = "$(stop) Stop watching for changes";
      this.compiler = webpack({
        mode: "none",
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
              else r({});
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
              loader: require.resolve("./ts-loader.js"),
              exclude: /node_modules/,
              options: {
                compiler: `${workspaceFolder}/node_modules/typescript`,
                onlyCompileBundledFiles: true,
                errorFormatter: (error: ErrorInfo, colors: chalk.Chalk) => {
                  return (
                    `${colors.cyan(
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
                    error.content
                  );
                }
              },
            },
          ],
        },
        resolve: {
          extensions: [".ts"],
        },
        entry: async () => {
          const output: Record<string, string> = {
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
        if (!this.firstRun) {
          terminal.clear();
          terminal.appendLine(chalk.yellowBright("Recompiling..."));
        }
        this.firstRun = false;
      });

      this.compiler.hooks.afterCompile.tap("pmd", (compilation) => {
        compilation.errors = compilation.errors.filter(
          (e) => e.name !== "ModuleBuildError"
        );

        for (const error of compilation.errors) {
          if (
            error.name === "ModuleNotFoundError" &&
            error.message.includes(resolve(this.cwd, "package.json"))
          ) {
            terminal.appendLine(chalk.red("package.json not valid"));
            continue;
          }

          terminal.appendLine(error.message);
        }

        if (compilation.errors.length === 0)
          return terminal.appendLine(chalk.greenBright("Successfully compiled!"));
        else {
          return terminal.appendLine(chalk.redBright(
            `Failed to compile with ${compilation.errors.length} error${compilation.errors.length === 1 ? "" : "s"
            }!`
          ));
        }
      });

      await new Promise((r) => (this.watching = this.compiler!.watch({}, r)));
    }

    async stop() {
      this.watching?.suspend();
      if (this.watching) await new Promise((r) => this.watching?.close(r));
    }

    async restart() {
      this.firstRun = true;
      await this.stop();
      await this.watch();
    }
  }

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
          return terminal.appendLine(chalk.redBright("Invalid package.json"));

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

  const command = commands.registerCommand(
    "presenceCompiler.stopCompiler",
    async () => {
      status.text = "$(loading~spin) Stopping the compiler...";
      await compiler.stop();
      status.dispose();
      terminal.dispose();
      command.dispose();
    }
  );

  compiler.watch();
}

function isTypescriptInstalled() {
  try {
    require(`${workspaceFolder}/node_modules/typescript`);
    return true;
  } catch {
    return false;
  }
}
