#!/usr/bin/env node
import "source-map-support/register.js";
import chalk from "chalk";
import { readFile } from "fs/promises";
import inquirer from "inquirer";
import { Command } from "commander";
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
const program = new Command();
program
    .allowUnknownOption()
    .option("-c, --create", "create a new Presence")
    .option("-m, --modify", "modify an existing presence")
    .option("-t, --translate", "translate a presence")
    .parse(process.argv);
const method = Object.keys(program.opts()).find((key) => program.opts()[key] === true);
if (method) {
    if (method === "create")
        console.log(chalk.green("?"), chalk.bold("What do you want to do?"), chalk.cyan("Create a new Presence"));
    await import(`./actions/${method}.js`);
}
else {
    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: [
                {
                    name: "Create a new Presence",
                    value: "create",
                },
                {
                    name: "Modify an existing Presence",
                    value: "modify",
                },
                {
                    name: "Translate a Presence",
                    value: "translate",
                },
            ],
        },
    ]);
    if (action)
        await import(`./actions/${action}.js`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLE9BQU8sZ0NBQWdDLENBQUM7QUFFeEMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBRXRCLE9BQU8saUJBQWlCLE1BQU0sa0NBQWtDLENBQUM7QUFDakUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTFDLElBQUksQ0FBQyxDQUFDLE1BQU0sY0FBYyxFQUFFLENBQUMsRUFBRTtJQUM3QixPQUFPLENBQUMsS0FBSyxDQUNYLE1BQU0sRUFDTixLQUFLLENBQUMsU0FBUyxDQUFDLHlEQUF5RCxDQUFDLENBQzNFLENBQUM7SUFDRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pCO0FBRUQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUMsS0FBSyxFQUFFLEVBQ3JELElBQUksR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7QUFDbkMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBRWYsSUFBSSxJQUFJO0lBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFFdEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM5QixPQUFPO0tBQ0osa0JBQWtCLEVBQUU7S0FDcEIsTUFBTSxDQUFDLGNBQWMsRUFBRSx1QkFBdUIsQ0FBQztLQUMvQyxNQUFNLENBQUMsY0FBYyxFQUFFLDZCQUE2QixDQUFDO0tBQ3JELE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQztLQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXZCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUM3QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FDdEMsQ0FBQztBQUVGLElBQUksTUFBTSxFQUFFO0lBQ1YsSUFBSSxNQUFNLEtBQUssUUFBUTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUNULEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQ2hCLEtBQUssQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsRUFDckMsS0FBSyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUNwQyxDQUFDO0lBQ0osTUFBTSxNQUFNLENBQUMsYUFBYSxNQUFNLEtBQUssQ0FBQyxDQUFDO0NBQ3hDO0tBQU07SUFDTCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFxQjtRQUMzRDtZQUNFLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLE9BQU8sRUFBRTtnQkFDUDtvQkFDRSxJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixLQUFLLEVBQUUsUUFBUTtpQkFDaEI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLDZCQUE2QjtvQkFDbkMsS0FBSyxFQUFFLFFBQVE7aUJBQ2hCO2dCQUNEO29CQUNFLElBQUksRUFBRSxzQkFBc0I7b0JBQzVCLEtBQUssRUFBRSxXQUFXO2lCQUNuQjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFDSCxJQUFJLE1BQU07UUFBRSxNQUFNLE1BQU0sQ0FBQyxhQUFhLE1BQU0sS0FBSyxDQUFDLENBQUM7Q0FDcEQ7QUFFRCxLQUFLLFVBQVUsY0FBYztJQUMzQixJQUFJO1FBQ0YsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN0RSxPQUFPLElBQUksS0FBSyxXQUFXLENBQUM7S0FDN0I7SUFBQyxNQUFNO1FBQ04sT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUMifQ==