"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@apollo/client/core");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const inquirer_1 = require("inquirer");
const getPresenceNames_1 = __importDefault(require("../util/getPresenceNames"));
async function create() {
    const apollo = new core_1.ApolloClient({
        cache: new core_1.InMemoryCache(),
        link: (0, core_1.createHttpLink)({
            uri: "https://api.premid.app/v3",
            fetch: cross_fetch_1.default
        })
    });
    let dUser = "";
    const inputs = await (0, inquirer_1.prompt)([
        {
            name: "name",
            message: "Enter the name of the service",
            type: "input",
            validate: async (v) => {
                if (!v.trim().length)
                    return "Name is required";
                if (v.trim().length < 2)
                    return "Name must be at least 2 characters long";
                return (await (0, getPresenceNames_1.default)()).includes(v)
                    ? `Presence with name ${v} already exists`
                    : true;
            }
        },
        {
            name: "description",
            message: "Enter the English description of the service",
            type: "input",
            validate: (v) => {
                if (!v.trim().length)
                    return "Description is required";
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
            validate: async (val) => {
                if (!val.trim().length)
                    return "You must enter a Discord Id";
                if (!val.trim().match(/\d+/g))
                    return "Invalid Discord Id";
                try {
                    dUser =
                        (await apollo.query({
                            query: (0, core_1.gql) `
									query getDiscordUser($user: String!) {
										discordUsers(userId: $user) {
											username
										}
									}
								`,
                            variables: { user: val }
                        })).data.discordUsers?.[0]?.username || null;
                    return dUser ? true : `User ${val} does not exist.`;
                }
                catch (err) {
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
exports.default = create;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29wdGlvbnMvY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsOENBQXVGO0FBQ3ZGLDhEQUFnQztBQUNoQyx1Q0FBa0M7QUFFbEMsZ0ZBQXdEO0FBRXpDLEtBQUssVUFBVSxNQUFNO0lBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksbUJBQVksQ0FBQztRQUMvQixLQUFLLEVBQUUsSUFBSSxvQkFBYSxFQUFFO1FBQzFCLElBQUksRUFBRSxJQUFBLHFCQUFjLEVBQUM7WUFDcEIsR0FBRyxFQUFFLDJCQUEyQjtZQUNoQyxLQUFLLEVBQUwscUJBQUs7U0FDTCxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsSUFBSSxLQUFLLEdBQVcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxpQkFBTSxFQUFDO1FBQzNCO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsK0JBQStCO1lBQ3hDLElBQUksRUFBRSxPQUFPO1lBQ2IsUUFBUSxFQUFFLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNO29CQUFFLE9BQU8sa0JBQWtCLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUN0QixPQUFPLHlDQUF5QyxDQUFDO2dCQUVsRCxPQUFPLENBQUMsTUFBTSxJQUFBLDBCQUFnQixHQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxDQUFDLENBQUMsc0JBQXNCLENBQUMsaUJBQWlCO29CQUMxQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ1QsQ0FBQztTQUNEO1FBQ0Q7WUFDQyxJQUFJLEVBQUUsYUFBYTtZQUNuQixPQUFPLEVBQUUsOENBQThDO1lBQ3ZELElBQUksRUFBRSxPQUFPO1lBQ2IsUUFBUSxFQUFFLENBQUMsQ0FBUyxFQUFFLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTTtvQkFBRSxPQUFPLHlCQUF5QixDQUFDO2dCQUN2RCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsRUFBRTtvQkFDdkIsT0FBTywrQ0FBK0MsQ0FBQztnQkFFeEQsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1NBQ0Q7UUFDRDtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxvQ0FBb0M7WUFDN0MsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQztTQUNsRTtRQUVEO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsdUJBQXVCO1lBQ2hDLElBQUksRUFBRSxPQUFPO1lBQ2IsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFXLEVBQUUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNO29CQUFFLE9BQU8sNkJBQTZCLENBQUM7Z0JBRTdELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFBRSxPQUFPLG9CQUFvQixDQUFDO2dCQUUzRCxJQUFJO29CQUNILEtBQUs7d0JBQ0osQ0FDQyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUM7NEJBQ2xCLEtBQUssRUFBRSxJQUFBLFVBQUcsRUFBQTs7Ozs7O1NBTVQ7NEJBQ0QsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTt5QkFDeEIsQ0FBQyxDQUNGLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsSUFBSSxJQUFJLENBQUM7b0JBRTVDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztpQkFDcEQ7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsT0FBTyxJQUFJLENBQUM7aUJBQ1o7WUFDRixDQUFDO1NBQ0Q7UUFDRDtZQUNDLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLDBDQUEwQztZQUNuRCxPQUFPLEVBQUUsS0FBSztZQUNkLElBQUksRUFBRSxTQUFTO1NBQ2Y7S0FDRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBakZELHlCQWlGQyJ9