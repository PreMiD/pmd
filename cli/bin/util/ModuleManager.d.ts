import { OutputTerminal } from "@ext/index";
export default class ModuleManager {
    cwd: string;
    dependencies: string[];
    devDependencies: string[];
    outputTerminal: OutputTerminal | undefined;
    constructor(cwd: string, outputTerminal?: OutputTerminal);
    isValidPackageJson(): Promise<boolean>;
    installDependencies(): Promise<void>;
}
