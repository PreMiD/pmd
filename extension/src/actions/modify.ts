import { commands, ExtensionContext, window } from "vscode";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import chalk from "chalk";

import OutputTerminal from "../util/OutputTerminal.js";
import fetchTemplate from "../functions/fetchTemplate.js";
import getPresences from "../functions/getPresences";
import { workspaceFolder } from "../extension.js";

import { getFolderLetter, Compiler } from "@pmd/cli";

interface Presence {
  service: string;
  url: string | string[];
}

const runningInstances: { [key: string]: string } = {};
export default async function modifyPresence(context: ExtensionContext, retry = false): Promise<any> {
  if (!isTypescriptInstalled()) {
    return window.showErrorMessage(
      "You need to have TypeScript locally installed to use this command."
    );
  }

  const instanceId = Math.random().toString(36).slice(2);
  const loadingStatus = window.setStatusBarMessage(
    "$(loading~spin) Loading the Presences..."
  );

  const presences: Presence[] = (await getPresences()).filter(({ service }: Presence) => !isAlreadyBeingModified(service));
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

  runningInstances[instanceId] = service;
  const presencePath = resolve(
    `${workspaceFolder}/websites/${getFolderLetter(service)}/${service}`
  );

  const terminal = new OutputTerminal(service);
  terminal.show();

  await writeFile(
    resolve(presencePath, "tsconfig.json"),
    JSON.stringify(await fetchTemplate("tsconfig.json"), null, 2)
  );

  const status = window.createStatusBarItem();
  status.text = "$(loading~spin) Starting TypeScript compiler...";
  status.command = `presenceCompiler.stopCompiler-${instanceId}`;
  status.show();

  terminal.appendLine(chalk.greenBright("Starting TypeScript compiler..."));
  const compiler = new Compiler(presencePath, {
    terminal,
    usePrefix: false
  });

  compiler.onStart = () => status.text = `$(stop) Stop compiling - ${service}`;
  compiler.onRecompile = () => terminal.clear();

  const command = commands.registerCommand(
    `presenceCompiler.stopCompiler-${instanceId}`,
    async () => {
      status.text = "$(loading~spin) Stopping the compiler...";
      delete runningInstances[instanceId];
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

function isAlreadyBeingModified(service: string) {
  return Object.values(runningInstances).includes(service);
}

function isTypescriptInstalled() {
  try {
    require(`${workspaceFolder}/node_modules/typescript`);
    return true;
  } catch {
    return false;
  }
}
