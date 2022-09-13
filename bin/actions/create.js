import chalk from "chalk";
import fetch from "cross-fetch";
import { access, cp, mkdir, readFile, writeFile } from "fs/promises";
import inquirer from "inquirer";
import { Validator } from "jsonschema";
import ora from "ora";
import { resolve } from "path";
import { fileURLToPath } from "url";
import getDiscordAppUser from "../functions/getDiscordAppUser.js";
import getDiscordUser from "../functions/getDiscordUser.js";
import getFolderLetter from "../functions/getFolderLetter.js";
import isFirstTimeAuthor from "../functions/isFirstTimeAuthor.js";
import { prefix } from "../util/prefix.js";
const v = new Validator();
const discordUser = await getDiscordAppUser();
const spinner = ora("Fetching Schema...").start();
const schema = await (await fetch("https://schemas.premid.app/metadata/1.7")).json();
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
                name: serviceAuthor.username + "#" + serviceAuthor.discriminator
            };
            return true;
        },
        transformer: (input) => {
            return serviceAuthor
                ? serviceAuthor.username + "#" + serviceAuthor.discriminator
                : input;
        }
    },
    {
        name: "url",
        message: "URL of the website",
        validate: (input) => {
            if (!input)
                return "URL cannot be empty!";
            let urls;
            if (input.split(",").length > 1)
                urls = input.split(",");
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
        message: "Tags of the Presence",
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
    name: `${serviceAuthor.username}#${serviceAuthor.discriminator}`
};
metadata.url = res.url.split(",").length > 1 ? res.url.split(",") : res.url;
metadata.logo = res.logo;
metadata.thumbnail = res.thumbnail;
metadata.color = res.color;
metadata.tags = res.tags.split(",");
metadata.category = res.category;
metadata.version = "1.0.0";
await writeFile(resolve(presencePath, "dist/metadata.json"), JSON.stringify(metadata, null, 2));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEtBQUssTUFBTSxhQUFhLENBQUM7QUFDaEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDckUsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdkMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUVwQyxPQUFPLGlCQUFpQixNQUFNLG1DQUFtQyxDQUFDO0FBQ2xFLE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFDO0FBQzVELE9BQU8sZUFBZSxNQUFNLGlDQUFpQyxDQUFDO0FBQzlELE9BQU8saUJBQWlCLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTNDLE1BQU0sQ0FBQyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7QUFFMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxpQkFBaUIsRUFBRSxDQUFDO0FBRTlDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBRWxELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FDcEIsTUFBTSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FDdEQsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUVULENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFD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