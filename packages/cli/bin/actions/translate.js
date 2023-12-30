import { gql } from "@apollo/client/core/index.js";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import inquirer from "inquirer";
import { getLanguage } from "language-flag-colors";
import { resolve } from "node:path";
import ora from "ora";
import prompts from "prompts";
import semver from "semver";
import fetchSchema from "../functions/fetchSchema.js";
import getFolderLetter from "../functions/getFolderLetter.js";
import getPresences from "../functions/getPresences.js";
import { apollo } from "../util/apollo.js";
import { prefix } from "../util/prefix.js";
const spinner = ora("Loading languages...").start();
const { coerce, inc, valid } = semver;
const { data: { langFiles }, } = await apollo.query({
    query: gql `
    query {
      langFiles(project: "website") {
        lang
      }
    }
  `,
});
const schema = await fetchSchema();
spinner.stop();
const { lang } = await prompts({
    name: "lang",
    message: "Select the language you want add translations for",
    type: "autocomplete",
    choices: langFiles
        .filter((l) => l.lang !== "en")
        .map((l) => ({
        title: getLanguage(l.lang.replace("_", "-"))?.nativeName ?? l.lang,
        description: l.lang,
        value: l.lang,
    })),
    suggest: async (input, choices) => {
        const regex = new RegExp(input, "i");
        return choices.filter((c) => regex.test(c.title) ||
            (c.description ? regex.test(c.description) : false));
    },
});
if (!lang) {
    console.log(prefix, chalk.redBright("No language selected, exiting..."));
    process.exit(0);
}
let presences = await getPresences();
const { mode } = await prompts([
    {
        type: "select",
        name: "mode",
        message: "What do you want to do?",
        choices: [
            {
                title: "Translate every Presence in order",
                value: 0,
            },
            {
                title: "Translate every Presence of category",
                value: 1,
            },
            {
                title: "Translate selected Presences",
                value: 2,
            },
        ],
    },
]);
const { selPresences, category } = await prompts([
    {
        type: mode === 1 ? "select" : false,
        name: "category",
        message: "Category of the service",
        choices: schema.properties.category.enum.map((c) => ({
            title: c,
            value: c,
        })),
    },
    {
        type: mode === 2 ? "autocompleteMultiselect" : false,
        name: "selPresences",
        message: "Select the Presences you want to translate",
        instructions: "Use arrow keys to select and space to toggle",
        choices: presences.map((p) => ({
            title: p.service,
            value: p,
        })),
        min: 1,
    },
]);
if (mode === 2) {
    await translatePresences(selPresences, lang);
    process.exit(0);
}
const { filterPresences } = await prompts([
    {
        type: "confirm",
        name: "filterPresences",
        message: "Filter out already translated Presences?",
    },
]);
if (filterPresences)
    presences = presences.filter((p) => !p.description?.[lang]);
if (category)
    presences = presences.filter((p) => p.category === category);
await translatePresences(presences, lang);
process.exit(0);
async function translatePresences(presences, lang) {
    if (!Array.isArray(presences))
        process.exit(0);
    for (const presence of presences) {
        const desc = presence.description?.[lang], enDesc = presence.description?.en;
        console.log(`${enDesc ? chalk.green(enDesc) + "\n\n" : ""}Type "skip" to skip or "stop" to stop translating.`);
        const { translation } = await inquirer.prompt({
            type: "input",
            name: "translation",
            message: presence.service,
            default: desc,
            validate: (input) => !!input ||
                "You need to enter a translation, or type 'skip' to skip, or 'stop' to stop translating.",
        });
        if (translation === "skip" || translation === desc)
            continue;
        if (translation === "stop")
            break;
        const presencePath = resolve(`./websites/${getFolderLetter(presence.service)}/${presence.service.replace("!", " ").trim()}`);
        presence.description[lang] = translation;
        if (valid(coerce(presence.version)))
            presence.version = inc(valid(coerce(presence.version)), "patch");
        else
            console.warn(`Invalid version for ${presence.service}, skipping version bump.`);
        await writeFile(resolve(presencePath, "metadata.json"), JSON.stringify(presence, null, "\t"));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRCxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUM5QixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFFNUIsT0FBTyxXQUFXLE1BQU0sNkJBQTZCLENBQUM7QUFDdEQsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxZQUFZLE1BQU0sOEJBQThCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFFdEMsTUFBTSxFQUNKLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxHQUNwQixHQUFHLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBb0M7SUFDeEQsS0FBSyxFQUFFLEdBQUcsQ0FBQTs7Ozs7O0dBTVQ7Q0FDRixDQUFDLENBQUM7QUFFSCxNQUFNLE1BQU0sR0FBRyxN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