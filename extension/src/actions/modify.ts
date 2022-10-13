import { commands, ExtensionContext, window } from "vscode";
import { getFolderLetter, getPresences } from "@pmd/cli";
import { basename, dirname, resolve } from "path";
import CopyPlugin from "copy-webpack-plugin";
import { rm, writeFile } from "fs/promises";
import { watch } from "chokidar";
import { existsSync } from "fs";
import webpack from "webpack";

import { ErrorInfo } from "ts-loader/dist/interfaces.js";

import ModuleManager from "../util/ModuleManager.js";
import { workspaceFolder } from "../extension.js";

import fetchTemplate from "../functions/fetchTemplate.js";

export default async function modifyPresence(context: ExtensionContext) {
  if (!isTypescriptInstalled()) {
    return window.showErrorMessage(
      "You need to have TypeScript locally installed to use this command."
    );
  }

  const loadingStatus = window.setStatusBarMessage(
    "$(loading~spin) Loading the Presences..."
  );
  const presences: { service: string }[] = await getPresences(
    `${workspaceFolder}/websites/*/*/metadata.json`
  );
  loadingStatus.dispose();

  const service = (
    await window.showQuickPick(
      presences.map(({ service }) => ({ label: service })),
      {
        title: "Select a presence to modify",
      }
    )
  )?.label;

  if (!service) return;

  const presencePath = resolve(
    `${workspaceFolder}/websites/${getFolderLetter(service)}/${service}`
  );

  const outputChannel = window.createOutputChannel("Presence Compiler");
  const moduleManager = new ModuleManager(presencePath, outputChannel);
  await moduleManager.installDependencies();

  await writeFile(
    resolve(presencePath, "tsconfig.json"),
    JSON.stringify(await fetchTemplate("tsconfig.json"), null, 2)
  );

  const status = window.createStatusBarItem();
  status.text = "$(loading~spin) Starting TypeScript compiler...";
  status.command = "presenceCompiler.stopCompiler";
  status.show();

  outputChannel.show();
  outputChannel.appendLine("Starting TypeScript compiler...");

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
        ],
        module: {
          rules: [
            {
              test: /\.ts$/,
              loader: require.resolve("./ts-loader.js"),
              exclude: /node_modules/,
              options: {
                onlyCompileBundledFiles: true,
                errorFormatter: (error: ErrorInfo) => {
                  return (
                    `${basename(dirname(error.file!)) +
                    "/" +
                    basename(error.file!)
                    }` +
                    ":" +
                    error.line +
                    ":" +
                    error.character +
                    " - " +
                    "Error " +
                    "TS" +
                    error.code +
                    ":" +
                    " " +
                    error.content
                  );
                },
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
          outputChannel.clear();
          outputChannel.appendLine("Recompiling...");
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
            outputChannel.appendLine("package.json not valid");
            continue;
          }

          outputChannel.appendLine(error.message);
        }

        if (compilation.errors.length === 0)
          return outputChannel.appendLine("Successfully compiled!");
        else {
          return outputChannel.appendLine(
            `Failed to compile with ${compilation.errors.length} error${compilation.errors.length === 1 ? "" : "s"
            }!`
          );
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
          return outputChannel.appendLine("Invalid package.json");

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
      outputChannel.dispose();
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
