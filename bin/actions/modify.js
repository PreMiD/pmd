import chalk from "chalk";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFFcEMsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxZQUFZLE1BQU0sOEJBQThCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTNDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLE9BQU8sQ0FBQztJQUNqQyxJQUFJLEVBQUUsU0FBUztJQUNmLE9BQU8sRUFBRSwyQ0FBMkM7SUFDcEQsSUFBSSxFQUFFLGNBQWM7SUFDcEIsT0FBTyxFQUFFLENBQ1IsTUFBTSxZQUFZLEVBQUUsQ0FDcEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1gsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPO1FBQ2hCLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU87UUFDNUIsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPO0tBQ2hCLENBQUMsQ0FBQztDQUNILENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxPQUFPO0lBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUU5QixNQUFNLFVBQVUsR0FBNkI7SUFDNUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FB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