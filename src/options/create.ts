import { ApolloClient, createHttpLink, gql, InMemoryCache } from "@apollo/client/core";
import fetch from "cross-fetch";
import { prompt } from "inquirer";

import getPresenceNames from "../util/getPresenceNames";

export default async function create() {
	const apollo = new ApolloClient({
		cache: new InMemoryCache(),
		link: createHttpLink({
			uri: "https://api.premid.app/v3",
			fetch
		})
	});

	let dUser: string = "";
	const inputs = await prompt([
		{
			name: "name",
			message: "Enter the name of the service",
			type: "input",
			validate: async v => {
				if (!v.trim().length) return "Name is required";
				if (v.trim().length < 2)
					return "Name must be at least 2 characters long";

				return (await getPresenceNames()).includes(v)
					? `Presence with name ${v} already exists`
					: true;
			}
		},
		{
			name: "description",
			message: "Enter the English description of the service",
			type: "input",
			validate: (v: string) => {
				if (!v.trim().length) return "Description is required";
				if (v.trim().length < 25)
					return "Description must be longer than 25 characters";

				return true;
			}
		},
		{
			name: "category",
			message: "Select the category of the service",
			type: "list",
			choices: ["anime", "games", "music", "socials", "videos", "other"]
		},

		{
			name: "user",
			message: "Enter your Discord Id",
			type: "input",
			validate: async (val: string) => {
				if (!val.trim().length) return "You must enter a Discord Id";

				if (!val.trim().match(/\d+/g)) return "Invalid Discord Id";

				try {
					dUser =
						(
							await apollo.query({
								query: gql`
									query getDiscordUser($user: String!) {
										discordUsers(userId: $user) {
											username
										}
									}
								`,
								variables: { user: val }
							})
						).data.discordUsers?.[0]?.username || null;

					return dUser ? true : `User ${val} does not exist.`;
				} catch (err) {
					return true;
				}
			}
		},
		{
			name: "iframe",
			message: "Do you need to access data in an iFrame?",
			default: false,
			type: "confirm"
		}
	]);
}
