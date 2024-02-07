import { Client } from "discord-rpc";
export let user;
export default function getDiscordAppUser() {
    return new Promise(async (res, rej) => {
        if (user)
            return res(user);
        const client = new Client({ transport: "ipc" });
        const t = setTimeout(() => {
            if (user)
                return res(user);
            client.destroy().catch(() => { });
            res(undefined);
        }, 500);
        try {
            await client.login({ clientId: "503557087041683458" });
            clearTimeout(t);
            await client.destroy();
        }
        catch { }
        user = client.user;
        res(client.user);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RGlzY29yZEFwcFVzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb25zL2dldERpc2NvcmRBcHBVc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQVEsTUFBTSxhQUFhLENBQUM7QUFFM0MsTUFBTSxDQUFDLElBQUksSUFBc0IsQ0FBQztBQUVsQyxNQUFNLENBQUMsT0FBTyxVQUFVLGlCQUFpQjtJQUN4QyxPQUFPLElBQUksT0FBTyxDQUFtQixLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3ZELElBQUksSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNCLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFaEQsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN6QixJQUFJLElBQUk7Z0JBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0IsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRVIsSUFBSTtZQUNILE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFDdkQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3ZCO1FBQUMsTUFBTSxHQUFFO1FBRVYsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFbkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMifQ==