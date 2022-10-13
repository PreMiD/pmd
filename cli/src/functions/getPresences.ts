import { readFile } from "fs/promises";
import { globby } from "globby";

export default async function getPresences(custuomPath?: string) {
  return await Promise.all(
    (
      await globby(custuomPath ?? "websites/*/*/metadata.json")
    ).map(async (s) => JSON.parse(await readFile(s, "utf-8")))
  );
}
