"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const displayastree_1 = require("displayastree");
const fs_1 = require("fs");
const glob_1 = require("glob");
const semver_1 = require("semver");
const outline_1 = __importDefault(require("../util/outline"));
async function bump() {
    const missingMetadata = (0, glob_1.sync)("./{websites,programs}/*/*/")
        .filter(pF => !(0, fs_1.existsSync)(`${pF}/dist/metadata.json`))
        .map(c => c.match(/.\/(websites|programs)\/.*\/(.*)\//)?.[2] ?? ""), invalidMetadata = [], allmeta = (0, glob_1.sync)("./{websites,programs}/*/*/*/metadata.json").map(pF => {
        const file = (0, fs_1.readFileSync)(pF, { encoding: "utf8" });
        if (isValidJSON(file))
            return [JSON.parse(file), pF];
        else {
            invalidMetadata.push(pF.match(/.\/(websites|programs)\/.*\/(.*)\//)?.[2] ?? "");
            return null;
        }
    });
    if (missingMetadata.length || invalidMetadata.length) {
        const invalids = missingMetadata
            .map(c => `${chalk_1.default.yellowBright(c)} • ${chalk_1.default.hex("#7289DA")("Missing metadata file")}`)
            .concat(invalidMetadata.map(c => `${chalk_1.default.yellowBright(c)} • ${chalk_1.default.hex("#7289DA")("Invalid metadata file")}`))
            .sort();
        (0, outline_1.default)(invalids, "•");
        new displayastree_1.Tree(chalk_1.default.redBright(missingMetadata.length + invalidMetadata.length > 1
            ? "Invalid Presences"
            : "Invalid Presence"))
            .addBranch(invalids)
            .log();
    }
    let count = 0;
    for (const metadata of allmeta) {
        if (metadata) {
            const newData = metadata[0];
            if (newData.version && (0, semver_1.valid)((0, semver_1.coerce)(newData.version))) {
                newData.version = (0, semver_1.inc)((0, semver_1.valid)((0, semver_1.coerce)(newData.version)), "patch");
                write(metadata[1], newData);
                count++;
            }
            else {
                try {
                    newData.version = "1.0.0";
                    write(metadata[1], newData);
                    count++;
                }
                catch (err) {
                    chalk_1.default.redBright(`Error. ${metadata[0].service && metadata[0].service.length > 0
                        ? metadata[0].service
                        : metadata[1]} didn't have a version in the metadata file, and pmd wasn't able to set it either...\n`);
                    continue;
                }
            }
        }
    }
    if (count > 0)
        console.log(chalk_1.default.green(`Bumped ${chalk_1.default.bold(count)} presences!`));
}
exports.default = bump;
function isValidJSON(text) {
    try {
        JSON.parse(text);
        return true;
    }
    catch {
        return false;
    }
}
function write(path, code) {
    (0, fs_1.writeFileSync)(path, JSON.stringify(code, null, 2), {
        encoding: "utf8",
        flag: "w"
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcHRpb25zL2J1bXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsaURBQXFDO0FBQ3JDLDJCQUE2RDtBQUM3RCwrQkFBb0M7QUFDcEMsbUNBQTRDO0FBRTVDLDhEQUFzQztBQUV2QixLQUFLLFVBQVUsSUFBSTtJQUNqQyxNQUFNLGVBQWUsR0FBYSxJQUFBLFdBQUksRUFBQyw0QkFBNEIsQ0FBQztTQUNqRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEsZUFBVSxFQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3JELEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUNwRSxlQUFlLEdBQWEsRUFBRSxFQUM5QixPQUFPLEdBQWtDLElBQUEsV0FBSSxFQUM1QywyQ0FBMkMsQ0FDM0MsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDVixNQUFNLElBQUksR0FBRyxJQUFBLGlCQUFZLEVBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDNUQ7WUFDSixlQUFlLENBQUMsSUFBSSxDQUNuQixFQUFFLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQ3pELENBQUM7WUFDRixPQUFPLElBQUksQ0FBQztTQUNaO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFJLGVBQWUsQ0FBQyxNQUFNLElBQUks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