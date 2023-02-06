import { commands, ExtensionContext, Uri, window } from "vscode";

import { writeFile } from "node:fs/promises";
import { unescape } from "node:querystring";
import { resolve } from "node:path";

import chalk from "chalk";

import OutputTerminal from "../util/OutputTerminal.js";
import fetchTemplate from "../functions/fetchTemplate.js";
import getPresences from "../functions/getPresences";
import { installDependencies, workspaceFolder } from "../extension.js";

import { getFolderLetter, Compiler } from "@pmd/cli";
import { existsSync } from "node:fs";

interface Presence {
  service: string;
  url: string | string[];
}

const runningInstances: { [key: string]: string } = {};
export default async function modifyPresence(context: ExtensionContext, retry = false): Promise<any> {
  if (!areDependenciesInstalled()) {
    return window.showErrorMessage(
      "You need to have the dependencies installed to use this command.",
      "Install Dependencies"
    ).then(async (choice) => {
      if (choice === "Install Dependencies") {
        installDependencies()
          .then(() => {
            window.showInformationMessage("Rerun the commmand?", "Yes").then((choice) => {
              if (choice === "Yes") modifyPresence(context);
            });
          })
          .catch(() => { });
      }
    });
  }

  const loadingStatus = window.setStatusBarMessage(
    "$(loading~spin) Loading the Presences..."
  );

  const presences: Presence[] = (await getPresences()).filter(({ service }: Presence) => !isBeingModified(service));
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

  const instanceId = Buffer.from(unescape(encodeURIComponent(service))).toString("base64");
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
  status.command = `stopCompiler-${instanceId}`;
  status.show();

  terminal.appendLine(chalk.greenBright("Starting TypeScript compiler..."));
  const compiler = new Compiler(presencePath, {
    terminal,
    usePrefix: false
  });

  compiler.onStart = () => {
    status.text = `$(stop) Stop compiling - ${service}`;

    window.showInformationMessage(`Compiler started for ${service}`, "Open presence.ts", "Open metadata.json").then((choice) => {
      switch (choice) {
        case "Open presence.ts":
          window.showTextDocument(
            Uri.file(resolve(presencePath, "presence.ts"))
          );
          break;
        case "Open metadata.json":
          window.showTextDocument(
            Uri.file(resolve(presencePath, "metadata.json"))
          );
          break;
      }
    });
  };
  compiler.onRecompile = () => terminal.clear();

  const command = commands.registerCommand(
    `stopCompiler-${instanceId}`,
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

export function isBeingModified(service: string) {
  return Object.values(runningInstances).includes(service);
}

function areDependenciesInstalled() {
  return existsSync(`${workspaceFolder}/node_modules`);
}
