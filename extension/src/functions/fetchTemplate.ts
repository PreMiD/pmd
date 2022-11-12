import axios from "axios";

export default async function fetchTemplate(file: string) {
  const content = (
    await axios.get(
      `https://raw.githubusercontent.com/Slowlife01/pmd/vscode/cli/template/${file}`
    )
  ).data;

  return content;
}
