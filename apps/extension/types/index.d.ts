export class OutputTerminal {
    private terminal;
    private emitter;
    constructor();
    append(...messages: string[]): void;
    appendLine(...messages: string[]): void;
    log(...messages: string[]): void;
    error(...messages: string[]): void;
    clear(): void;
    show(preserveFocus?: boolean): void;
    hide(): void;
    dispose(): void;
}
