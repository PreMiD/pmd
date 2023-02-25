import { workspace } from "vscode";
import { presencesGlobPattern } from "../extension";

export default async function isFirstTimeAuthor(author: string): Promise<any> {
    const presences = await workspace.findFiles(presencesGlobPattern);

    for (const presence of presences) {
        const file = await workspace.fs.readFile(presence);
        const content = new TextDecoder().decode(file);
        const { author: { id } } = JSON.parse(content);

        if (author !== id) continue;
        return false;
    }

    return true;
}