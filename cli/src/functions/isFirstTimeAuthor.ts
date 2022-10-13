import { readFile } from "fs/promises";
import { globby } from "globby";

export default async function isFirstTimeAuthor(
  author: string,
  custuomPath?: string
) {
  for (const m of await globby(custuomPath ?? "websites/*/*/metadata.json")) {
    const {
      author: { id },
    } = JSON.parse(await readFile(m, "utf-8"));

    if (author !== id) continue;

    return false;
  }

  return true;
}
