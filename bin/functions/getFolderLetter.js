export default function getFolderLetter(service) {
    const firstLetter = service.at(0).toUpperCase();
    if (firstLetter.match(/[A-Za-z0-9]/))
        return firstLetter;
    return "#";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Rm9sZGVyTGV0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Z1bmN0aW9ucy9nZXRGb2xkZXJMZXR0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE9BQU8sVUFBVSxlQUFlLENBQUMsT0FBZTtJQUN0RCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRWpELElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFBRSxPQUFPLFdBQVcsQ0FBQztJQUV6RCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUMifQ==