import { readFile } from "fs/promises";
import { globby } from "globby";

<<<<<<< HEAD
export default async function getPresences() {
  return await Promise.all(
    (
      await globby("websites/*/*/metadata.json")
=======
export default async function getPresences(custuomPath?: string) {
  return await Promise.all(
    (
      await globby(custuomPath ?? "websites/*/*/metadata.json")
>>>>>>> b5dbc10 (feat: vscode extension)
    ).map(async (s) => JSON.parse(await readFile(s, "utf-8")))
  );
}
