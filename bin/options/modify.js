"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = __importDefault(require("prompts"));
const getPresenceNames_1 = __importDefault(require("../util/getPresenceNames"));
async function modify() {
    const presence = await (0, prompts_1.default)([
        {
            name: "presence",
            message: "Select or search for a Presence",
            initial: "PreMiD",
            type: "autocomplete",
            choices: (await (0, getPresenceNames_1.default)()).map(p => ({ title: p }))
        }
    ]);
    console.log(presence);
}
exports.default = modify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29wdGlvbnMvbW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsc0RBQThCO0FBRTlCLGdGQUF3RDtBQUV6QyxLQUFLLFVBQVUsTUFBTTtJQUNuQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsaUJBQU8sRUFBQztRQUM5QjtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLE9BQU8sRUFBRSxpQ0FBaUM7WUFDMUMsT0FBTyxFQUFFLFFBQVE7WUFDakIsSUFBSSxFQUFFLGNBQWM7WUFDcEIsT0FBTyxFQUFFLENBQUMsTUFBTSxJQUFBLDBCQUFnQixHQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDNUQ7S0FDRCxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZCLENBQUM7QUFaRCx5QkFZQyJ9