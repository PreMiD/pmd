import fetch from "cross-fetch";
import semver from "semver";

const fallbackVersion = "1.10";

export async function getLatestSchema(): Promise<string> {
  const fetchedSchemas = await fetch(
    "https://api.github.com/repos/PreMiD/Schemas/contents/schemas/metadata"
  ).then((res) => res.json());

  if (
    fetchedSchemas.statusCode !== 200 ||
    !Array.isArray(fetchedSchemas.body)
  ) {
    return fallbackVersion;
  }
  const schemas: string[] = fetchedSchemas.body.map(
    (schema: { name: string }) => schema.name.replace(".json", "")
  );
  schemas.sort((a, b) => {
    return semver.gt(a, b) ? -1 : 1;
  });
  return schemas[0];
}

export default async function fetchSchema() {
  const latestSchema = await getLatestSchema();
  return (
    await fetch(`https://schemas.premid.app/metadata/${latestSchema}`)
  ).json();
}
