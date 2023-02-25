import { workspace } from "vscode";
import { presencesGlobPattern } from "../extension";

export default async function getPresences(): Promise<any> {
    const presences = await workspace.findFiles(presencesGlobPattern);

    return Promise.all(presences.map(async (presence) => {
        const file = await workspace.fs.readFile(presence);
        const content = new TextDecoder().decode(file);

        return JSON.parse(content);
    }));
}