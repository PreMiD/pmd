"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
async function getPresenceNames() {
    const folders = (await Promise.all((await (0, promises_1.readdir)("./websites")).map(f => (0, promises_1.readdir)((0, path_1.resolve)("./websites", f))))).flat();
    return folders;
}
exports.default = getPresenceNames;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UHJlc2VuY2VOYW1lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2dldFByZXNlbmNlTmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBc0M7QUFDdEMsK0JBQStCO0FBRWhCLEtBQUssVUFBVSxnQkFBZ0I7SUFDN0MsTUFBTSxPQUFPLEdBQUcsQ0FDZixNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2hCLENBQUMsTUFBTSxJQUFBLGtCQUFPLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGtCQUFPLEVBQUMsSUFBQSxjQUFPLEVBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDekUsQ0FDRCxDQUFDLElBQUksRUFBRSxDQUFDO0lBRVQsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQztBQVJELG1DQVFDIn0=