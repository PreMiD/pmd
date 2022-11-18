import { basename, resolve } from "node:path";
import { createRequire } from "node:module";
import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { watch } from "chokidar";
import prompts from "prompts";
import chalk from "chalk";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
import ModuleManager from "../util/ModuleManager.js";
import Compiler from "../util/PresenceCompiler.js";
import { prefix } from "../util/prefix.js";
const { service } = await prompts({
    name: "service",
    message: "Select or search for a presence to modify",
    type: "autocomplete",
    choices: (await getPresences()).map(s => ({
        title: s.service,
        description: "v" + s.version,
        value: s.service
    }))
});
if (!service)
    process.exit(0);
const require = createRequire(import.meta.url);
const presencePath = resolve(`./websites/${getFolderLetter(service)}/${service}`);
const moduleManager = new ModuleManager(presencePath);
await moduleManager.installDependencies();
await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
const compiler = new Compiler(presencePath);
watch(presencePath, { depth: 0, persistent: true, ignoreInitial: true }).on("all", async (event, file) => {
    if (["add", "unlink"].includes(event) && basename(file) === "iframe.ts")
        return await compiler.restart();
    if (basename(file) === "package.json") {
        if (["add", "change"].includes(event) &&
            !(await moduleManager.isValidPackageJson()))
            return console.error(prefix, chalk.redBright("Invalid package.json!"));
        await compiler.stop();
        if ("change" === event)
            await moduleManager.installDependencies();
        else if (event === "unlink") {
            if (existsSync(resolve(presencePath, "node_modules")))
                rm(resolve(presencePath, "node_modules"), { recursive: true });
            if (existsSync(resolve(presencePath, "package-lock.json")))
                rm(resolve(presencePath, "package-lock.json"));
        }
        compiler.restart();
    }
});
compiler.watch({
    loader: require.resolve("ts-loader")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzlDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDNUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFckMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNqQyxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRTFCLE9BQU8sZUFBZSxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFDO0FBRXhELE9BQU8sYUFBYSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sUUFBUSxNQUFNLDZCQUE2QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUM7SUFDakMsSUFBSSxFQUFFLFNBQVM7SUFDZixPQUFPLEVBQUUsMkNBQTJDO0lBQ3BELElBQUksRUFBRSxjQUFjO0lBQ3BCLE9BQU8sRUFBRSxDQUNSLE1BQU0sWUFBWSxFQUFFLENBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztRQUNoQixXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPO1FBQzVCLEtBQUssRUFBRSxDQUFD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