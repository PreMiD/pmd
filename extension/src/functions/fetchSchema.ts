import axios from "axios";

export default async function fetchSchema() {
	const versions = (
		(
			await axios.get(
				'https://api.github.com/repos/PreMiD/Schemas/contents/schemas/metadata'
			)
		).data as { name: string }[]
	)
		.filter((c) => c.name.endsWith('.json'))
		.map((c) => c.name.match(/\d.\d/g)?.[0]);

	return (
		await axios.get(
			`https://raw.githubusercontent.com/PreMiD/Schemas/main/schemas/metadata/${versions.at(
				-1
			)}.json`
		)
	).data;
}
