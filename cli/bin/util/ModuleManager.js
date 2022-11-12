import { exec } from "child_process";
import { resolve } from "path";
import { existsSync } from "fs";
import ora from "ora";
import { prefix } from "./prefix.js";
import chalk from "chalk";
import { readFile } from "fs/promises";
export default class ModuleManager {
    cwd;
    dependencies = [];
    devDependencies = [];
    outputTerminal;
    constructor(cwd, outputTerminal) {
        this.cwd = cwd;
        this.outputTerminal = outputTerminal;
    }
    async isValidPackageJson() {
        if (!existsSync(resolve(this.cwd, "package.json")))
            return false;
        try {
            JSON.parse(await readFile(resolve(this.cwd, "package.json"), "utf8"));
            return true;
        }
        catch {
            return false;
        }
    }
    async installDependencies() {
        const prevNodeEnv = process.env.NODE_ENV;
        delete process.env.NODE_ENV;
        if (!(await this.isValidPackageJson()))
            return;
        let spinner;
        if (!this.outputTerminal) {
            spinner = ora(prefix + chalk.yellow(" Installing dependencies...")).start();
        }
        else
            this.outputTerminal.appendLine(chalk.yellow("Installing dependencies..."));
        const job = exec("npm install --loglevel error --save-exact", {
            cwd: this.cwd
        });
        let errorChunks = [];
        job.stderr?.on("data", data => {
            errorChunks = errorChunks.concat(data);
        });
        await new Promise(r => job.once("exit", code => {
            if (code === 0) {
                if (spinner)
                    spinner.succeed(prefix + chalk.green(" Installed dependencies!"));
                else
                    this.outputTerminal.appendLine(chalk.green("Installed dependencies!"));
                return r();
            }
            if (spinner)
                spinner.fail(prefix + " " + chalk.red(errorChunks.join("")));
            else
                this.outputTerminal.appendLine(chalk.red(errorChunks.join("")));
            r();
        }));
        process.env.NODE_ENV = prevNodeEnv;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kdWxlTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL01vZHVsZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9CLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDaEMsT0FBTyxHQUFZLE1BQU0sS0FBSyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDckMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQzFCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHdkMsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFhO0lBS2Q7SUFKbkIsWUFBWSxHQUFhLEVBQUUsQ0FBQztJQUM1QixlQUFlLEdBQWEsRUFBRSxDQUFDO0lBQy9CLGNBQWMsQ0FBNkI7SUFFM0MsWUFBbUIsR0FBVyxFQUFFLGNBQStCO1FBQTVDLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFDN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDdEMsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0I7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWpFLElBQUk7WUFDSCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdEUsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUFDLE1BQU07WUFDUCxPQUFPLEtBQUssQ0FBQztTQUNiO0lBQ0YsQ0FBQztJQUVELEtBQUssQ0FBQyxtQkFBbUI7UUFDeEIsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDekMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUU1QixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQUUsT0FBTztRQUUvQyxJQUFJLE9BQVksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN6QixPQUFPLEdBQUcsR0FBRyxDQUNaLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLDZCQUE2QixDQUFDLENBQ3BELENBQUMsS0FBSyxFQUFFLENBQUM7U0FDVjs7WUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztRQUdsRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsMkNBQTJDLEVBQUU7WUFDN0QsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1NBQ2IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxXQUFXLEdBQVUsRUFBRSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM3QixXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBSSxPQUFPLENBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDdkIsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO2dCQUNmLElBQUksT0FBTztvQkFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQzs7b0JBQzFFLElBQUksQ0FBQyxjQUFlLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxPQUFPLENBQUMsRUFBRSxDQUFDO2FBQ1g7WUFFRCxJQUFJLE9BQU87Z0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUNyRSxJQUFJLENBQUMsY0FBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLENBQUMsRUFBRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQ0YsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQztJQUNwQyxDQUFDO0NBQ0QifQ==
