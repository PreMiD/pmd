import { resolve } from "node:path";
import { createRequire } from "node:module";
import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import chalk from "chalk";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
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
await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
const compiler = new Compiler(presencePath);
compiler.watch({
    loader: require.resolve("ts-loader")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM1QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV6QyxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRTFCLE9BQU8sZUFBZSxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFDO0FBRXhELE9BQU8sUUFBUSxNQUFNLDZCQUE2QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUM7SUFDakMsSUFBSSxFQUFFLFNBQVM7SUFDZixPQUFPLEVBQUUsMkNBQTJDO0lBQ3BELElBQUksRUFBRSxjQUFjO0lBQ3BCLE9BQU8sRUFBRSxDQUNSLE1BQU0sWUFBWSxFQUFFLENBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztRQUNoQixXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPO1FBQzVCLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztLQUNoQixDQUFDLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsT0FBTztJQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFOUIsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0MsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUMzQixjQUFjLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FDbkQsQ0FBQztBQUVGLE1BQU0sRUFBRSxDQUNQLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxpQ0FBaUMsQ0FBQyxFQUMxRSxPQUFPLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUN0QyxDQUFDO0FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFNUMsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUNkLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztDQUNwQyxDQUFDLENBQUMifQ==