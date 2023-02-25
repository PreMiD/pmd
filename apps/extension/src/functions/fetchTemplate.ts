import axios from "axios";

export default async function fetchTemplate(file: string) {
  const content = (
    await axios.get(
      `https://raw.githubusercontent.com/PreMiD/pmd/main/template/${file}`
    )
  ).data;

  return content;
}
