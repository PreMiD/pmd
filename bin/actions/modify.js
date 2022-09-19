import chalk from "chalk";
import { watch } from "fs";
import { cp } from "fs/promises";
import { basename, dirname, resolve } from "path";
import prompts from "prompts";
import ts from "typescript";
import { fileURLToPath } from "url";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
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
const formatHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine
};
const presencePath = resolve(`./websites/${getFolderLetter(service)}/${service}`);
await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
const configPath = ts.findConfigFile(presencePath, ts.sys.fileExists, "tsconfig.json");
if (!configPath) {
    console.error("Could not find a valid 'tsconfig.json'.");
    process.exit(1);
}
const reportWatchStatusChanged = (diagnostic, _newLine, _options, errorCount) => {
    switch (diagnostic.code) {
        case 6031:
            return console.log(prefix, chalk.greenBright("Starting TypeScript compiler..."));
        case 6194:
            if (errorCount === 0)
                return console.log(prefix, chalk.greenBright("Successfully compiled!"));
            else
                return console.log(prefix, chalk.redBright(`Failed to compile with ${errorCount} error${errorCount === 1 ? "" : "s"}!`));
        case 6032:
            return console.log(prefix, chalk.yellowBright("Recompiling..."));
        case 6193:
            return console.error(prefix, chalk.redBright(`Failed to compile with 1 error!`));
        default:
            return console.info(ts.formatDiagnostic(diagnostic, formatHost));
    }
};
const reportDiagnostic = diagnostic => {
    const { character, line } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    console.error(prefix, chalk.cyan(basename(dirname(diagnostic.file?.fileName)) +
        "/" +
        basename(diagnostic.file?.fileName)) +
        ":" +
        chalk.yellowBright(line + 1) +
        ":" +
        chalk.yellowBright(character + 1), "-", chalk.redBright("Error ") + chalk.gray("TS" + diagnostic.code + ":"), ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine()));
};
const compilerHost = ts.createWatchCompilerHost(configPath, {}, ts.sys, ts.createEmitAndSemanticDiagnosticsBuilderProgram, reportDiagnostic, reportWatchStatusChanged);
ts.createWatchProgram(compilerHost);
await cp(resolve(presencePath, "metadata.json"), resolve(presencePath, "dist/metadata.json"));
watch(resolve(presencePath, "metadata.json"), () => cp(resolve(presencePath, "metadata.json"), resolve(presencePath, "dist/metadata.json")));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQzNCLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDakMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xELE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUVwQyxPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM5RCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDO0lBQ2pDLElBQUksRUFBRSxTQUFTO0lBQ2YsT0FBTyxFQUFFLDJDQUEyQztJQUNwRCxJQUFJLEVBQUUsY0FBYztJQUNwQixPQUFPLEVBQUUsQ0FDUixNQUFNLFlBQVksRUFBRSxDQUNwQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDWCxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU87UUFDaEIsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTztRQUM1QixLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU87S0FDaEIsQ0FBQyxDQUFDO0NBQ0gsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLE9BQU87SUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRTlCLE1BQU0sVUFBVSxH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