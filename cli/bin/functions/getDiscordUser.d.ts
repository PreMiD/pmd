export default function getDiscordUser(id: string): Promise<{
    username?: string | undefined;
    discriminator?: string | undefined;
} | null>;
