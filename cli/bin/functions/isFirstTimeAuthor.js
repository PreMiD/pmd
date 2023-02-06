import { readFile } from "fs/promises";
import { globby } from "globby";
export default async function isFirstTimeAuthor(author, custuomPath) {
    for (const m of await globby(custuomPath ?? "websites/*/*/metadata.json")) {
        const { author: { id }, } = JSON.parse(await readFile(m, "utf-8"));
        if (author !== id)
            continue;
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNGaXJzdFRpbWVBdXRob3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZnVuY3Rpb25zL2lzRmlyc3RUaW1lQXV0aG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUVoQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxpQkFBaUIsQ0FDN0MsTUFBYyxFQUNkLFdBQW9CO0lBRXBCLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxNQUFNLENBQUMsV0FBVyxJQUFJLDRCQUE0QixDQUFDLEVBQUU7UUFDekUsTUFBTSxFQUNKLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUNmLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLFFBQVEsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUUzQyxJQUFJLE1BQU0sS0FBSyxFQUFFO1lBQUUsU0FBUztRQUU1QixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIn0=