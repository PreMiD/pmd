import { OutputTerminal } from "@ext/index";
export default class Compiler {
    private cwd;
    private options;
    private compiler;
    private watching;
    private output;
    prefix: string;
    onStart?: () => void;
    onRecompile?: () => void;
    firstRun: boolean;
    constructor(cwd: string, options?: {
        usePrefix?: boolean;
        terminal?: OutputTerminal;
    });
    watch(options?: {
        compiler?: string;
        loader?: string;
    }): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
}
