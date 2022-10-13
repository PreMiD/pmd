export default class ModuleManager {
    cwd: string;
    dependencies: string[];
    devDependencies: string[];
    constructor(cwd: string);
    isValidPackageJson(): Promise<boolean>;
    installDependencies(): Promise<void>;
}
