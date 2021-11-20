#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.contributors = exports.author = exports.version = exports.name = void 0;
require("source-map-support/register");
const chalk_1 = __importDefault(require("chalk"));
const prompts_1 = __importDefault(require("prompts"));
const bump_1 = __importDefault(require("./options/bump"));
const create_1 = __importDefault(require("./options/create"));
const modify_1 = __importDefault(require("./options/modify"));
const configHandler_1 = __importDefault(require("./util/configHandler"));
_a = require("../package.json"), exports.name = _a.name, exports.version = _a.version, exports.author = _a.author, exports.contributors = _a.contributors, exports.config = (0, configHandler_1.default)();
async function run() {
    console.log(chalk_1.default.green(`Launching ${chalk_1.default.bold(exports.name)} ${chalk_1.default.hex("#bebebe")("(v" + exports.version + ")")}…`));
    if (exports.config.create)
        return (0, create_1.default)();
    if (exports.config.modify)
        return (0, modify_1.default)();
    if (exports.config.bump)
        return (0, bump_1.default)();
    const mainPrompt = await (0, prompts_1.default)([
        {
            name: "main",
            message: "Select an option",
            hint: "Use arrow-keys. Press enter to submit.",
            type: "select",
            choices: [
                {
                    title: "Create Presence",
                    description: "Creates a new Presence."
                },
                {
                    title: "Modify Presence",
                    description: "Modify an existing Presence."
                }
            ]
        }
    ]);
    if (mainPrompt.main === 0)
        return (0, create_1.default)();
    else
        return (0, modify_1.default)();
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFFckMsa0RBQTBCO0FBQzFCLHNEQUE4QjtBQUU5QiwwREFBa0M7QUFDbEMsOERBQXNDO0FBQ3RDLDhEQUFzQztBQUN0Qyx5RUFBdUM7QUFFMUIsS0FXUixPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFWN0IsWUFBSSxZQUNKLGVBQU8sZUFDUCxjQUFNLGNBQ04sb0JBQVksb0JBUWIsUUFBQSxNQUFNLEdBQUcsSUFBQSx1QkFBRyxHQUFFLENBQUM7QUFFaEIsS0FBSyxVQUFVLEdBQUc7SUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FDVixlQUFLLENBQUMsS0FBSyxDQUNWLGFBQWEsZUFBSyxDQUFDLElBQUksQ0FBQyxZQUFJLENBQUMsSUFBSSxlQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUNwRCxJQUFJLEdBQUcsZUFBTyxHQUFHLEdBQUcsQ0FDcEIsR0FBRyxDQUNKLENBQ0QsQ0FBQztJQUVGLElBQUksY0FBTSxDQUFDLE1BQU07UUFBRSxPQUFPLElBQUEsZ0JBQU0sR0FBRSxDQUFDO0lBQ25DLElBQUksY0FBTSxDQUFDLE1BQU07UUFBRSxPQUFPLElBQUEsZ0JBQU0sR0FBRSxDQUFDO0lBQ25DLElBQUksY0FBTSxDQUFDLElBQUk7UUFBRSxPQUFPLElBQUEsY0FBSSxHQUFFLENBQUM7SUFFL0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLGlCQUFPLEVBQUM7UUFDaEM7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsSUFBSSxFQUFFLHdDQUF3QztZQUM5QyxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRTtnQkFDUjtvQkFDQyxLQUFLLEVBQUUsaUJBQWlCO29CQUN4QixXQUFXLEVBQUUseUJBQXlCO2lCQUN0QztnQkFDRDtvQkFDQyxLQUFLLEVBQUUsaUJBQWlCO29CQUN4QixXQUFXLEVBQUUsOEJBQThCO2lCQUMzQzthQUNEO1NBQ0Q7S0FDRCxDQUFDLENBQUM7SUFFSCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUFFLE9BQU8sSUFBQSxnQkFBTSxHQUFFLENBQUM7O1FBQ3RDLE9BQU8sSUFBQSxnQkFBTSxHQUFFLENBQUM7QUFDdEIsQ0FBQztBQUVELEdBQUcsRUFBRSxDQUFDIn0=