import { User } from "discord-rpc";
export declare let user: User | undefined;
export default function getDiscordAppUser(): Promise<User | undefined>;
