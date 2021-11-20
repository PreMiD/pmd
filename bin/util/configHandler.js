"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const command_line_args_1 = __importDefault(require("command-line-args"));
const displayastree_1 = require("displayastree");
const __1 = require("..");
const outline_1 = __importDefault(require("./outline"));
function config() {
    let config;
    if (process.argv.includes("-h") || process.argv.includes("--help")) {
        new displayastree_1.Tree(chalk_1.default.green(`${chalk_1.default.bold("PMD")} ${chalk_1.default.hex("#bebebe")("(v" + __1.version + ")")}`))
            .addBranch([
            chalk_1.default.hex("#ebc14d")(`Author: ${chalk_1.default.hex("#bebebe")(__1.author)}`),
            chalk_1.default.hex("#ebc14d")(`Contributor${__1.contributors.length === 1 ? "" : "s"}: ${chalk_1.default.hex("#bebebe")(__1.contributors.join(chalk_1.default.hex("#ebc14d")(", ")))}`)
        ])
            .log();
        showAvailableArgs();
        process.exit();
    }
    config = (0, command_line_args_1.default)([
        {
            name: "create",
            defaultValue: false,
            alias: "c",
            type: Boolean
        },
        {
            name: "modify",
            defaultValue: false,
            alias: "m",
            type: Boolean
        },
        { name: "bump", defaultValue: false, alias: "b", type: Boolean }
    ], { stopAtFirstUnknown: false, partial: true });
    return config;
}
exports.default = config;
function showAvailableArgs() {
    const configDescriptions = {
        create: {
            type: "boolean",
            alias: "c",
            description: "Go straight to presence creation"
        },
        modify: {
            type: "boolean",
            alias: "m",
            description: "Go straight to presence modification"
        },
        bump: {
            type: "boolean",
            alias: "b",
            description: "Bump the versions of all presences"
        }
    };
    let settings = [];
    for (const [k, v] of Object.entries(configDescriptions)) {
        settings.push(`${chalk_1.default.yellowBright("--" + k)}${v.alias ? chalk_1.default.italic(" (-" + v.alias + ")") : ""} * ${chalk_1.default.underline(chalk_1.default.hex("#bebebe")(v.type))} • ${chalk_1.default.hex("#7289DA")(v.description)}`);
    }
    (0, outline_1.default)(settings, "(");
    (0, outline_1.default)(settings, "*");
    (0, outline_1.default)(settings, "•");
    settings = settings.map(c => c.replaceAll("* ", ""));
    new displayastree_1.Tree(chalk_1.default.bold(chalk_1.default.green("Available arguments")))
        .addBranch(settings)
        .log();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2NvbmZpZ0hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBMEI7QUFDMUIsMEVBQXdDO0FBQ3hDLGlEQUFxQztBQUVyQywwQkFBbUQ7QUFDbkQsd0RBQWdDO0FBUWhDLFNBQXdCLE1BQU07SUFDN0IsSUFBSSxNQUFjLENBQUM7SUFFbkIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNuRSxJQUFJLG9CQUFJLENBQ1AsZUFBSyxDQUFDLEtBQUssQ0FDVixHQUFHLGVBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksZUFBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEdBQUcsV0FBTyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQ3BFLENBQ0Q7YUFDQyxTQUFTLENBQUM7WUFDVixlQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsZUFBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxVQUFNLENBQUMsRUFBRSxDQUFDO1lBQy9ELGVBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQ25CLGNBQWMsZ0JBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxlQUFLLENBQUMsR0FBRyxDQUMvRCxTQUFTLENBQ1QsQ0FBQyxnQkFBWSxDQUFDLElBQUksQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNsRDtTQUNELENBQUM7YUFDRCxHQUFHLEVBQUUsQ0FBQztRQUNSLGlCQUFpQixFQUFFLENB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