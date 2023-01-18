import chalk from "chalk";
import { access, cp, mkdir, readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import { Validator } from "jsonschema";
import ora from "ora";
import { resolve } from "path";
import { fileURLToPath } from "url";
import fetchSchema from "../functions/fetchSchema.js";
import getDiscordAppUser from "../functions/getDiscordAppUser.js";
import getDiscordUser from "../functions/getDiscordUser.js";
import getFolderLetter from "../functions/getFolderLetter.js";
import isFirstTimeAuthor from "../functions/isFirstTimeAuthor.js";
import { prefix } from "../util/prefix.js";
const v = new Validator();
const discordUser = await getDiscordAppUser();
const spinner = ora("Fetching Schema...").start();
const schema = await fetchSchema();
v.addSchema({ definitions: schema.definitions });
spinner.stop().clear();
let serviceAuthor;
const metadata = JSON.parse(await readFile(resolve(fileURLToPath(import.meta.url), "../../../template/metadata.json"), "utf8"));
const res = await inquirer.prompt([
    {
        name: "service",
        message: "Presence name",
        validate: async (input) => {
            if (!input)
                return "Presence name cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.service);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            if (await serviceExists(input))
                return "Presence already exists!";
            return true;
        }
    },
    {
        name: "description",
        message: "English description of the Presence",
        validate: (input) => {
            if (!input)
                return "Description cannot be empty!";
            const schemaRes = v.validate({ en: input }, schema.properties.description);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        }
    },
    {
        name: "author",
        message: "Discord ID of the author",
        default: discordUser?.id,
        validate: async (input) => {
            if (!input)
                return "Author cannot be empty!";
            const schemaRes = v.validate({ id: input, name: "" }, schema.properties.author);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            serviceAuthor = discordUser ?? (await getDiscordUser(input));
            if (!serviceAuthor)
                return "User not found.";
            metadata.author = {
                id: input,
                name: serviceAuthor.username
            };
            return true;
        },
        transformer: (input) => {
            return serviceAuthor
                ? serviceAuthor.username
                : input;
        }
    },
    {
        name: "url",
        message: "URL of the website (separate multiple URLs with a comma)",
        validate: (input) => {
            if (!input)
                return "URL cannot be empty!";
            let urls;
            if (input.split(",").length > 1)
                urls = input.split(",").map((url) => url.trim());
            else
                urls = input;
            const schemaRes = v.validate(urls, schema.properties.url);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        }
    },
    {
        name: "logo",
        message: "Imgur URL of the logo",
        validate: (input) => {
            if (!input)
                return "Logo cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.logo);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        }
    },
    {
        name: "thumbnail",
        message: "Imgur URL of the thumbnail",
        validate: (input) => {
            if (!input)
                return "Thumbnail cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.thumbnail);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        }
    },
    {
        name: "color",
        message: "Theme color of the Presence",
        validate: (input) => {
            if (!input)
                return "Color cannot be empty!";
            const schemaRes = v.validate(input, schema.properties.color);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        }
    },
    {
        name: "tags",
        message: "Tags of the Presence (separate multiple tags with a comma)",
        validate: (input) => {
            if (!input)
                return "Tags cannot be empty!";
            const schemaRes = v.validate(input.split(","), schema.properties.tags);
            if (!schemaRes.valid)
                return schemaRes.errors[0].message;
            return true;
        }
    },
    {
        name: "category",
        message: "Category of the service",
        type: "list",
        choices: schema.properties.category.enum
    }
]);
const presencePath = resolve(`./websites/${getFolderLetter(res.service)}/${res.service}`);
await mkdir(resolve(presencePath, "dist"), {
    recursive: true
});
metadata.service = res.service;
metadata.description = { en: res.description };
metadata.author = {
    id: res.author,
    name: serviceAuthor.username
};
metadata.url = res.url.split(",").length > 1 ? res.url.split(",") : res.url;
metadata.logo = res.logo;
metadata.thumbnail = res.thumbnail;
metadata.color = res.color;
metadata.tags = res.tags.split(",");
metadata.category = res.category;
metadata.version = "1.0.0";
await writeFile(resolve(presencePath, "metadata.json"), JSON.stringify(metadata, null, "\t"));
await cp(resolve(fileURLToPath(import.meta.url), "../../../template/tsconfig.json"), resolve(presencePath, "tsconfig.json"));
const presenceFileToCopy = (await isFirstTimeAuthor(res.author))
    ? "presence.ts"
    : "presence.min.ts";
await cp(resolve(fileURLToPath(import.meta.url), `../../../template/${presenceFileToCopy}`), resolve(presencePath, "presence.ts"));
console.log(prefix, chalk.green("Presence created! You can now start coding!"));
async function serviceExists(service) {
    try {
        await access(`./websites/${service.at(0).toUpperCase()}/${service}`);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyRSxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2QyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDdEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRXBDLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RELE9BQU8saUJBQWlCLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxjQUFjLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUQsT0FBTyxlQUFlLE1BQU0saUNBQWlDLENBQUM7QUFDOUQsT0FBTyxpQkFBaUIsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFM0MsTUFBTSxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUUxQixNQUFNLFdBQVcsR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFFbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLEVBQUUsQ0FBQztBQUVuQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBRWpELE9BQU8sQ0FBQyxJQUFJ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