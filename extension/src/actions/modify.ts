import { commands, ExtensionContext, window } from "vscode";
import { basename, resolve } from "path";
import chalk from "chalk";
import { rm, writeFile } from "fs/promises";
import { watch } from "chokidar";
import { existsSync } from "fs";

import OutputTerminal from "../util/OutputTerminal.js";
import fetchTemplate from "../functions/fetchTemplate.js";
import getPresences from "../functions/getPresences";
import { workspaceFolder } from "../extension.js";

import { getFolderLetter, ModuleManager, Compiler } from "@pmd/cli";

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
  terminal.show();

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

  terminal.appendLine(chalk.greenBright("Starting TypeScript compiler..."));
  const compiler = new Compiler(presencePath, {
    terminal,
    usePrefix: false
  });

  compiler.onStart = () => status.text = "$(stop) Stop watching for changes";
  compiler.onRecompile = () => terminal.clear();

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

  compiler.watch({
    compiler: `${workspaceFolder}/node_modules/typescript`,
    loader: require.resolve("./ts-loader.js")
  });
}

function isTypescriptInstalled() {
  try {
    require(`${workspaceFolder}/node_modules/typescript`);
    return true;
  } catch {
    return false;
  }
}
