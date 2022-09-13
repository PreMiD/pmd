import chalk from "chalk";
import { basename, dirname } from "path";
import prompts from "prompts";
import ts from "typescript";
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
const configPath = ts.findConfigFile(`./websites/${getFolderLetter(service)}/${service}`, ts.sys.fileExists, "tsconfig.json");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6QyxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTVCLE9BQU8sZUFBZSxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUM7SUFDakMsSUFBSSxFQUFFLFNBQVM7SUFDZixPQUFPLEVBQUUsMkNBQTJDO0lBQ3BELElBQUksRUFBRSxjQUFjO0lBQ3BCLE9BQU8sRUFBRSxDQUNSLE1BQU0sWUFBWSxFQUFFLENBQ3BCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztRQUNoQixXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPO1FBQzVCLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTztLQUNoQixDQUFDLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsT0FBTztJQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFOUIsTUFBTSxVQUFVLEdBQTZCO0lBQzVDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTtJQUNsQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtJQUMvQyxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFD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