import { commands, ExtensionContext, window, workspace, RelativePattern } from "vscode";

import { readFile } from "node:fs/promises";
import { exec } from "node:child_process";

import createPresence from "./actions/create";
import modifyPresence from "./actions/modify";

export function activate(context: ExtensionContext) {
  const disposables = [
    commands.registerCommand("pmd.createPresence", handleCommand, {
      name: "createPresence",
      context,
    }),
    commands.registerCommand("pmd.modifyPresence", handleCommand, {
      name: "modifyPresence",
      context,
    }),
  ];

  context.subscriptions.push(...disposables);
}

export const workspaceFolder = workspace.workspaceFolders?.[0].uri.fsPath as string;
export const presencesGlobPattern = new RelativePattern(workspaceFolder ?? "", "websites/*/*/metadata.json");

export function installDependencies() {
  const status = window.setStatusBarMessage("$(loading~spin) Installing dependencies...");

  window.showInformationMessage("Installing dependencies...");

  return new Promise<void>((resolve, reject) => {
    exec("npm install", {
      cwd: workspaceFolder
    }, (err, stdout, stderr) => {
      if (err) {
        window.showErrorMessage("An error occurred while installing the dependencies");
        reject(err);
      } else window.showInformationMessage("Dependencies installed successfully!");

      status.dispose();
      resolve();
    });
  });
}

async function handleCommand(this: {
  name: string;
  context: ExtensionContext;
}) {
  const command = this;
  if (!(await inPresenceRepo())) {
    return window.showErrorMessage(
      "You need to be in the Presences repository to use this command."
    );
  }

  switch (command.name) {
    case "createPresence":
      return createPresence(command.context);
    case "modifyPresence":
      return modifyPresence(command.context);
  }
}

async function inPresenceRepo() {
  try {
    const { name } = JSON.parse(
      await readFile(`${workspaceFolder}/package.json`, "utf8")
    );
    return name === "presences";
  } catch {
    return false;
  }
}
