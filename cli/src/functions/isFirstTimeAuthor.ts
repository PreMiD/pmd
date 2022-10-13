import { readFile } from "fs/promises";
import { globby } from "globby";

<<<<<<< HEAD
export default async function isFirstTimeAuthor(author: string) {
  for (const m of await globby("websites/*/*/metadata.json")) {
=======
export default async function isFirstTimeAuthor(
  author: string,
  custuomPath?: string
) {
  for (const m of await globby(custuomPath ?? "websites/*/*/metadata.json")) {
>>>>>>> b5dbc10 (feat: vscode extension)
    const {
      author: { id },
    } = JSON.parse(await readFile(m, "utf-8"));

    if (author !== id) continue;

    return false;
  }

  return true;
}
