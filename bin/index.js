#!/usr/bin/env node
import "source-map-support/register.js";
import chalk from "chalk";
import { readFile } from "fs/promises";
import inquirer from "inquirer";
import ora from "ora";
import getDiscordAppUser from "./functions/getDiscordAppUser.js";
import { prefix } from "./util/prefix.js";
if (!(await inPresenceRepo())) {
    console.error(prefix, chalk.redBright("This command can only be run in the presence repository"));
    process.exit(1);
}
const spinner = ora("Fetching Discord User...").start(), user = await getDiscordAppUser();
spinner.stop();
if (user)
    console.log(prefix, `Hello ${chalk.green(user.username)}!`);
const { action } = await inquirer.prompt([
    {
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices: [
            {
                name: "Create a new Presence",
                value: 0
            },
            {
                name: "Modify an existing Presence",
                value: 1
            },
            {
                name: "Translate a Presence",
                value: 2
            }
        ]
    }
]);
switch (action) {
    case 0:
        await import("./actions/create.js");
        break;
    case 1:
        await import("./actions/modify.js");
        break;
    case 2:
        await import("./actions/translate.js");
        break;
}
async function inPresenceRepo() {
    try {
        const { name } = JSON.parse(await readFile("./package.json", "utf8"));
        return name === "presences";
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sZ0NBQWdDLENBQUM7QUFFeEMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQztBQUV0QixPQUFPLGlCQUFpQixNQUFNLGtDQUFrQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUUxQyxJQUFJLENBQUMsQ0FBQyxNQUFNLGNBQWMsRUFBRSxDQUFDLEVBQUU7SUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FDWixNQUFNLEVBQ04sS0FBSyxDQUFDLFNBQVMsQ0FBQyx5REFBeUQsQ0FBQyxDQUMxRSxDQUFDO0lBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNoQjtBQUVELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUN0RCxJQUFJLEdBQUcsTUFBTSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2xDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUVmLElBQUksSUFBSTtJQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRXRFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQXFCO0lBQzVEO1FBQ0MsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSx5QkFBeUI7UUFDbEMsT0FBTyxFQUFFO1lBQ1I7Z0JBQ0MsSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsS0FBSyxFQUFFLENBQUM7YUFDUjtZQUNEO2dCQUNDLElBQUksRUFBRSw2QkFBNkI7Z0JBQ25DLEtBQUssRUFBRSxDQUFDO2FBQ1I7WUFDRDtnQkFDQyxJQUFJLEVBQUUsc0JBQXNCO2dCQUM1QixLQUFLLEVBQUUsQ0FBQzthQUNSO1NBQ0Q7S0FDRDtDQUNELENBQUMsQ0FBQztBQUVILFFBQVEsTUFBTSxFQUFFO0lBQ2YsS0FBSyxDQUFDO1FBQ0wsTUFBTSxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNwQyxNQUFNO0lBQ1AsS0FBSyxDQUFDO1FBQ0wsTUFBTSxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNwQyxNQUFNO0lBQ1AsS0FBSyxDQUFDO1FBQ0wsTUFBTSxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN2QyxNQUFNO0NBQ1A7QUFFRCxLQUFLLFVBQVUsY0FBYztJQUM1QixJQUFJO1FBQ0gsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN0RSxPQUFPLElBQUksS0FBSyxXQUFXLENBQUM7S0FDNUI7SUFBQyxNQUFNO1FBQ1AsT0FBTyxLQUFLLENBQUM7S0FDYjtBQUNGLENBQUMifQ==