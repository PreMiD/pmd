import { window, ExtensionContext, Uri, ThemeIcon } from "vscode";

import { access, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { Validator } from "jsonschema";
import {
  getDiscordAppUser,
  getDiscordUser,
  getFolderLetter,
  fetchSchema,
} from "@pmd/cli";

import { MultiStepInput } from "../util/MultiStepInput";

import isFirstTimeAuthor from "../functions/isFirstTimeAuthor";
import fetchTemplate from "../functions/fetchTemplate";

import { installDependencies, workspaceFolder } from "../extension";

export default async function createPresence(context: ExtensionContext) {
  interface State {
    service: string;
    description: string;
    discordId: string;
    url: string;
    logo: string;
    thumbnail: string;
    color: string;
    tags: string;
    category: string;
    completed: boolean;
  }

  window.setStatusBarMessage("$(loading~spin) Fetching schema...", 2000);
  const validator = new Validator();
  const schema = await fetchSchema();
  validator.addSchema({ definitions: schema.definitions });

  async function collectInputs() {
    const state = {} as Partial<State>;
    state.discordId = (await fetchDiscordAppUser())?.id;

    await MultiStepInput.run((input) => inputName(input, state));
    return state as State;
  }

  const title = "Create a Presence";
  async function inputName(input: MultiStepInput, state: Partial<State>) {
    state.service = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 7,
      value: state.service || "",
      prompt: "Presence name",
      validate: async (input: string) => {
        if (!input) return "Presence name cannot be empty";
        const schemaRes = validator.validate(input, schema.properties.service);

        if (!schemaRes.valid) return schemaRes.errors[0].message;
        if (await serviceExists(input)) return "Presence already exists";
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputDescription(input, state);
  }

  async function inputDescription(
    input: MultiStepInput,
    state: Partial<State>
  ) {
    state.description = await input.showInputBox({
      title,
      step: 2,
      totalSteps: 7,
      value: state.description || "",
      prompt: "English description of the Presence",
      validate: async (input: string) => {
        if (!input) return "Description cannot be empty";
        const schemaRes = validator.validate(
          { en: input },
          schema.properties.description
        );

        if (!schemaRes.valid) return schemaRes.errors[0].message;
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputDiscordId(input, state);
  }

  async function inputDiscordId(input: MultiStepInput, state: Partial<State>) {
    state.discordId = await input.showInputBox({
      title,
      step: 3,
      totalSteps: 7,
      value: state.discordId || "",
      prompt: "Discord ID of the author",
      buttons: [
        {
          iconPath: new ThemeIcon("sync"),
          tooltip: "Get your Discord ID via IPC",
          onClick: async (input) => {
            const user = await fetchDiscordAppUser();
            if (user) input.value = user.id;
          },
        },
      ],
      validate: async (input: string) => {
        if (!input) return "Author cannot be empty";
        if (!/^[0-9]{17,}$/.test(input) || !(await getDiscordUser(input)))
          return "Invalid Discord ID";
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputUrls(input, state);
  }

  async function inputUrls(input: MultiStepInput, state: Partial<State>) {
    state.url = await input.showInputBox({
      title,
      step: 4,
      totalSteps: 7,
      value: state.url || "",
      placeHolder: "premid.app, docs.premid.app",
      prompt: "URL of the website (separate multiple URLs with a comma)",
      validate: async (input: string) => {
        if (!input) return "Website URL cannot be empty";
        const schemaRes = validator.validate(
          input.includes(",") ? input.split(",") : input,
          schema.properties.url
        );

        if (!schemaRes.valid) return schemaRes.errors[0].message;
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputLogo(input, state);
  }

  async function inputLogo(input: MultiStepInput, state: Partial<State>) {
    state.logo = await input.showInputBox({
      title,
      step: 5,
      totalSteps: 7,
      value: state.logo || "",
      prompt: "Imgur URL of the logo",
      placeHolder: "https://i.imgur.com/xXxXxXx.png",
      validate: async (input: string) => {
        if (!input) return "Logo URL cannot be empty";
        const schemaRes = validator.validate(input, schema.properties.logo);

        if (!schemaRes.valid) return schemaRes.errors[0].message;
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputThumbnail(input, state);
  }

  async function inputThumbnail(input: MultiStepInput, state: Partial<State>) {
    state.thumbnail = await input.showInputBox({
      title,
      step: 6,
      totalSteps: 7,
      value: state.thumbnail || "",
      prompt: "Imgur URL of the thumbnail",
      placeHolder: "https://i.imgur.com/xXxXxXx.png",
      validate: async (input: string) => {
        if (!input) return "Thumbnail URL cannot be empty";
        const schemaRes = validator.validate(
          input,
          schema.properties.thumbnail
        );

        if (!schemaRes.valid) return schemaRes.errors[0].message;
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputColor(input, state);
  }

  async function inputColor(input: MultiStepInput, state: Partial<State>) {
    state.color = await input.showInputBox({
      title,
      step: 7,
      totalSteps: 8,
      value: state.color || "",
      placeHolder: "#000000",
      prompt: "Theme color (Hex) of the Presence",
      validate: async (input: string) => {
        if (!input) return "Theme Color cannot be empty";
        const schemaRes = validator.validate(input, schema.properties.color);

        if (!schemaRes.valid) return schemaRes.errors[0].message;
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => inputTags(input, state);
  }

  async function inputTags(input: MultiStepInput, state: Partial<State>) {
    state.tags = await input.showInputBox({
      title,
      step: 7,
      totalSteps: 8,
      value: state.tags || "",
      prompt: "Tags of the Presence (separate multiple tags with a comma)",
      validate: async (input: string) => {
        if (!input) return "Tags cannot be empty";
        const schemaRes = validator.validate(
          input.split(","),
          schema.properties.tags
        );

        if (!schemaRes.valid) return schemaRes.errors[0].message;
      },
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => pickCategory(input, state);
  }

  async function pickCategory(input: MultiStepInput, state: Partial<State>) {
    state.category = (
      await input.showQuickPick({
        title,
        step: 8,
        totalSteps: 8,
        items: ["anime", "games", "music", "socials", "videos", "other"].map(
          (label) => ({
            label,
          })
        ),
        placeholder: "Pick a category of the service",
        activeItem: state.category ? { label: state.category } : undefined,
        shouldResume: shouldResume,
      })
    ).label;
    state.completed = true;
  }

  async function serviceExists(service: string) {
    try {
      await access(
        `${workspaceFolder}/websites/${getFolderLetter(service)}/${service}`
      );
      return true;
    } catch {
      return false;
    }
  }

  async function shouldResume() {
    const choice = await window.showInformationMessage(
      "Resume the creation process?",
      "Yes"
    );
    return choice === "Yes";
  }

  const state = await collectInputs();
  if (state.completed) {
    window.showInformationMessage(`Creating the Presence '${state.service}'`);

    const presencePath = resolve(
      `${workspaceFolder}/websites/${getFolderLetter(state.service)}/${state.service
      }`
    );

    await mkdir(resolve(presencePath, "dist"), {
      recursive: true,
    });

    const metadata = await fetchTemplate("metadata.json");
    const serviceAuthor = await getDiscordUser(state.discordId);

    metadata.service = state.service;
    metadata.description = { en: state.description };
    metadata.author = {
      id: state.discordId,
      name: serviceAuthor!.username,
    };
    metadata.url =
      state.url.split(",").length > 1 ? state.url.split(",") : state.url;
    metadata.logo = state.logo;
    metadata.thumbnail = state.thumbnail;
    metadata.color = state.color;
    metadata.tags = state.tags.split(",");
    metadata.category = state.category;
    metadata.version = "1.0.0";

    await writeFile(
      resolve(presencePath, "tsconfig.json"),
      JSON.stringify(await fetchTemplate("tsconfig.json"), null, 2)
    );

    const presenceFileToCopy = (await isFirstTimeAuthor(state.discordId))
      ? "presence.ts"
      : "presence.min.ts";

    await writeFile(
      resolve(presencePath, "presence.ts"),
      await fetchTemplate(presenceFileToCopy)
    );

    await writeFile(
      resolve(presencePath, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );

    window
      .showInformationMessage(
        "Presence created! You can now start coding!",
        "Open presence.ts",
        "Open metadata.json"
      )
      .then((choice) => {
        switch (choice) {
          case "Open presence.ts":
            window.showTextDocument(
              Uri.file(resolve(presencePath, "presence.ts"))
            );
            break;
          case "Open metadata.json":
            window.showTextDocument(
              Uri.file(resolve(presencePath, "metadata.json"))
            );
            break;
        }
      });

    if (!existsSync(resolve(workspaceFolder, "node_modules"))) {
      window.showInformationMessage("You don't have the dependencies installed, do you want to install them now?", "Yes").then(async (choice) => {
        if (choice === "Yes") installDependencies();
      });
    }
  }
}

async function fetchDiscordAppUser() {
  window.setStatusBarMessage(
    "$(loading~spin) Fetching your Discord user via IPC...",
    500
  );
  const user = await getDiscordAppUser();
  if (user)
    window.setStatusBarMessage(
      `$(check) Found ${user.username}#${user.discriminator}`,
      1000
    );
  else window.setStatusBarMessage("$(error) Couldn't find your Discord user via IPC", 1000);

  return user;
}
