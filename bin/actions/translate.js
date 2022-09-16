import { gql } from "@apollo/client/core/index.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { getLanguage } from "language-flag-colors";
import ora from "ora";
import prompts from "prompts";
import fetchSchema from "../functions/fetchSchema.js";
import getPresences from "../functions/getPresences.js";
import { apollo } from "../util/apollo.js";
const spinner = ora("Loading languages...").start();
const { data: { langFiles } } = await apollo.query({
    query: gql `
		query {
			langFiles(project: "website") {
				lang
			}
		}
	`
});
const schema = await fetchSchema();
spinner.stop();
const { lang } = await prompts({
    name: "lang",
    message: "Select the language you want add translations for",
    type: "autocomplete",
    choices: langFiles
        .filter(l => l.lang !== "en")
        .map(l => ({
        title: getLanguage(l.lang.replace("_", "-"))?.nativeName ?? l.lang,
        description: l.lang,
        value: l.lang
    })),
    suggest: async (input, choices) => {
        const regex = new RegExp(input, "i");
        return choices.filter(c => regex.test(c.title) ||
            (c.description ? regex.test(c.description) : false));
    }
});
let presences = await getPresences();
const { mode } = await prompts([
    {
        type: "select",
        name: "mode",
        message: "What do you want to do?",
        choices: [
            {
                title: "Translate every Presence in order",
                value: 0
            },
            {
                title: "Translate every Presence of category",
                value: 1
            },
            {
                title: "Translate selected Presences",
                value: 2
            }
        ]
    }
]);
const { selPresences, category } = await prompts([
    {
        type: mode === 2 ? "autocompleteMultiselect" : false,
        name: "selPresences",
        message: "Select the Presences you want to translate",
        instructions: "Use arrow keys to select and space to toggle",
        choices: presences.map(p => ({
            title: p.service,
            value: p
        })),
        min: 1
    },
    {
        type: "list",
        name: "category",
        message: "Category of the service",
        choices: schema.properties.category.enum
    }
]);
if (mode === 2) {
    await translatePresences(selPresences);
    process.exit(0);
}
const { filterPresences } = await prompts([
    {
        type: "confirm",
        name: "filterPresences",
        message: "Filter out already translated Presences?"
    }
]);
if (filterPresences)
    presences = presences.filter(p => !p.description?.[lang]);
if (category)
    presences = presences.filter(p => p.category === category);
await translatePresences(presences);
process.exit(0);
async function translatePresences(presences) {
    for (const presence of presences) {
        const desc = presence.description?.[lang];
        console.log(`${desc ? chalk.green(desc) + "\n\n" : ""}Type "skip" to skip or "stop" to stop translating.`);
        const { translation } = await inquirer.prompt({
            type: "input",
            name: "translation",
            message: presence.service,
            default: desc
        });
        if (translation === "skip" || translation === desc)
            continue;
        if (translation === "stop")
            break;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRCxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDdEIsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBRTlCLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RELE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUVwRCxNQUFNLEVBQ0wsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQ25CLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFvQztJQUN6RCxLQUFLLEVBQUUsR0FBRyxDQUFBOzs7Ozs7RUFNVDtDQUNELENBQUMsQ0FBQztBQUVILE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxFQUFFLENBQUM7QUFFbkMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBRWYsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sT0FBTyxDQUFDO0lBQzlCLElBQUksRUFBRSxNQUFNO0lBQ1osT0FBTyxFQUFFLG1EQUFtRDtJQUM1RCxJQUFJLEVBQUUsY0FBYztJQUNwQixPQUFPLEVBQUUsU0FBUztTQUNoQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQztTQUM1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