import { resolve } from "node:path";
import { createRequire } from "node:module";
import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import prompts from "prompts";
import chalk from "chalk";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
import Compiler from "../util/PresenceCompiler.js";
import { prefix } from "../util/prefix.js";
const program = new Command();
program
    .allowUnknownOption()
    .option("-m, --modify [presence]")
    .parse(process.argv);
let service = program.getOptionValue("modify");
if (typeof service !== "string") {
    service = (await prompts({
        name: "service",
        message: "Select or search for a presence to modify",
        type: "autocomplete",
        choices: (await getPresences()).map((s) => ({
            title: s.service,
            description: "v" + s.version,
            value: s.service,
        })),
    })).service;
    if (!service)
        process.exit(0);
}
else {
    if (!(await getPresences())
        .map((s) => ({
        title: s.service,
    }))
        .find((p) => p.title.toLowerCase() === service.toLowerCase())) {
        console.log(prefix, chalk.redBright("Could not find presence:", service));
        process.exit(0);
    }
}
const require = createRequire(import.meta.url);
const presencePath = resolve(`./websites/${getFolderLetter(service)}/${service.replace("!", " ")}`);
await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
const compiler = new Compiler(presencePath);
compiler.watch({
    loader: require.resolve("ts-loader"),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM1QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3BDLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxZQUFZLE1BQU0sOEJBQThCLENBQUM7QUFFeEQsT0FBTyxRQUFRLE1BQU0sNkJBQTZCLENBQUM7QUFDbkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTNDLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDOUIsT0FBTztLQUNKLGtCQUFrQixFQUFFO0tBQ3BCLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQztLQUNqQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXZCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFL0MsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7SUFDL0IsT0FBTyxHQUFHLENBQ1IsTUFBTSxPQUFPLENBQUM7UUFDWixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSwyQ0FBMkM7UUFDcEQsSUFBSSxFQUFFLGNBQWM7UUFDcEIsT0FBTyxFQUFFLENBQ1AsTUFBTSxZQUFZLEVBQUUsQ0FDckIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU87WUFDaEIsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTztZQUM1QixLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU87U0FDakIsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUNILENBQUMsT0FBTyxDQUFDO0lBQ1YsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQy9CO0tBQU07SUFFTCxJQUNFLENBQUMsQ0FBQyxNQUFNLFlBQVksRUFBRSxDQUFDO1NBQ3BCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztLQUNqQixDQUFDLENBQUM7U0FDRixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQy9EO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7Q0FDRjtBQUVELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FDMUIsY0FBYyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FDdEUsQ0FBQztBQUVGLE1BQU0sRUFBRSxDQUNOLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxpQ0FBaUMsQ0FBQyxFQUMxRSxPQUFPLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUN2QyxDQUFDO0FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFNUMsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUNiLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztDQUNyQyxDQUFDLENBQUMifQ==