"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function outline(stringArray, splitter) {
    let highestLength = 0;
    stringArray.forEach(message => {
        if (message.includes(splitter) &&
            message.split(splitter)[0].length > highestLength)
            highestLength = message.split(splitter)[0].length;
    });
    stringArray.forEach((message, index) => {
        if (message.includes(splitter) &&
            message.split(splitter)[0].length !== highestLength) {
            const difference = highestLength - message.split(splitter)[0].length;
            let newMessage = message.split(splitter)[0];
            for (let i = 0; i < difference; i++) {
                newMessage += " ";
            }
            newMessage += splitter + message.split(splitter)[1];
            stringArray[index] = newMessage;
        }
    });
}
exports.default = outline;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL291dGxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxTQUF3QixPQUFPLENBQUMsV0FBcUIsRUFBRSxRQUFnQjtJQUN0RSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFFdEIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM3QixJQUNDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLGFBQWE7WUFFakQsYUFBYSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BELENBQUMsQ0FBQyxDQUFDO0lBRUgsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUN0QyxJQUNDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsRUFDbEQ7WUFDRCxNQUFNLFVBQVUsR0FBRyxhQUFhLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDckUsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQyxVQUFVLElBQUksR0FBRyxDQUFDO2FBQ2xCO1lBQ0QsVUFBVSxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BELFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7U0FDaEM7SUFDRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUF6QkQsMEJBeUJDIn0=