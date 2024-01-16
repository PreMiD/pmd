const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const prompts = require("prompts");
require("dotenv").config({ path: "release.env" });
const { Octokit } = require("octokit");

const version =
  process.env.version_overwrite || require("./package.json").version;
const packageName = `packages-cli-release-v${version}`;
const destinationDir = path.resolve(__dirname, "..", packageName);
const githubRepository = process.env.origin;
const branchName = "cli-release-v" + version;

const copyDirectory = (source, destination, excludedItems) => {
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source).forEach((file) => {
    if (!excludedItems.includes(file)) {
      const sourcePath = path.join(source, file);
      const destinationPath = path.join(destination, file);
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destinationPath);
      } else {
        copyDirectory(sourcePath, destinationPath, excludedItems);
      }
    }
  });
};

try {
  if (!version) throw new Error("Please specify a version for release");

  const match = githubRepository.match(
    /https:\/\/github\.com\/([^/]+)\/([^/.]+)\.git/
  );

  if (!match) throw new Error("Invalid GitHub URL");

  try {
    fs.rmSync(destinationDir, { recursive: true });
  } catch {}

  const sourceDir = __dirname;
  const excludedItems = [
    "src",
    "tsconfig.js",
    "template",
    "node_modules",
    ".gitignore",
    "pnpm-lock.yaml",
    "release-cli.cjs",
  ];

  copyDirectory(sourceDir, destinationDir, excludedItems);

  const templateSource = path.join("template");
  const templateDestination = path.join(destinationDir, "template");
  copyDirectory(templateSource, templateDestination, []);

  process.chdir(destinationDir);
  execSync("git init");
  execSync("git add .");
  execSync(`git remote add origin ${githubRepository}`);
  execSync(`git commit -m "Release v${version}"`);
  execSync(`git checkout -b ${branchName}`);
  execSync(`git push -u origin ${branchName}`);

  process.chdir("..");
  fs.rmSync(destinationDir, { recursive: true });
  console.log("Successfully created a branch to release from!");

  if (process.env.TOKEN) release(match);
} catch (error) {
  try {
    fs.rmSync(destinationDir, { recursive: true });
  } catch {}
  console.error(`Error: ${error.message}`);
}

async function release(match) {
  const response = await prompts({
    type: "toggle",
    name: "value",
    message: "Do you want to automatically create a release?",
    initial: true,
    active: "yes",
    inactive: "no",
  });
  if (response.value == false) return;
  const octokit = new Octokit({
    auth: process.env.TOKEN,
  });

  const release = await octokit
    .request("POST /repos/{owner}/{repo}/releases", {
      owner: match[1],
      repo: match[2],
      tag_name: version,
      target_commitish: branchName,
      name: version,
      draft: false,
      prerelease: false,
      generate_release_notes: true,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .catch(async (e) => {
      console.log(e.response.data.errors);
      if (
        (
          await prompts({
            type: "toggle",
            name: "value",
            message: "Delete branch from remote? (advised)",
            initial: true,
            active: "yes",
            inactive: "no",
          })
        ).value == false
      )
        return;

      execSync(`git push origin -d ${branchName}`);
    });
  if (!release) return;
  console.log(
    "\x1b[32mCreated release successfully:\x1b[36m\x1b[4m",
    release.data.html_url,
    "\x1b[0m"
  );

  if (
    (
      await prompts({
        type: "toggle",
        name: "value",
        message: "Delete branch from remote? (advised)",
        initial: true,
        active: "yes",
        inactive: "no",
      })
    ).value == false
  )
    return;

  execSync(`git push origin -d ${branchName}`);
}
