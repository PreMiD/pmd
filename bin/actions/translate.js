import { gql } from "@apollo/client/core/index.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { getLanguage } from "language-flag-colors";
import ora from "ora";
import prompts from "prompts";
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
spinner.stop();
const { lang } = await prompts({
    name: "lang",
    message: "Select the language you want add translations for",
    type: "autocomplete",
    choices: langFiles.map(l => ({
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
const presences = await getPresences();
const { mode, selPresences } = await prompts([
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
    },
    {
        type: prev => (prev === 2 ? "autocompleteMultiselect" : false),
        name: "selPresences",
        message: "Select the Presences you want to translate",
        instructions: "Use arrow keys to select and space to toggle",
        choices: presences.map(p => ({
            title: p.service,
            value: p
        })),
        min: 1
    }
]);
if (mode === 2) {
    for (const presence of selPresences) {
        const desc = presence.description?.[lang];
        console.log(`${desc ? chalk.green(desc) + "\n\n" : ""}Type "skip" to skip or "stop" to stop translating.`);
        await inquirer.prompt({
            type: "editor",
            name: "translation",
            message: presence.service,
            default: desc
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvdHJhbnNsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRCxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDdEIsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBRTlCLE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUVwRCxNQUFNLEVBQ0wsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQ25CLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFvQztJQUN6RCxLQUFLLEVBQUUsR0FBRyxDQUFBOzs7Ozs7RUFNVDtDQUNELENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUVmLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLE9BQU8sQ0FBQztJQUM5QixJQUFJLEVBQUUsTUFBTTtJQUNaLE9BQU8sRUFBRSxtREFBbUQ7SUFDNUQsSUFBSSxFQUFFLGNBQWM7SUFDcEIsT0FBTyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxJQUFJLENBQUMsQ0FB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