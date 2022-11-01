import { EventEmitter, Terminal, window, ThemeIcon, commands } from "vscode"

export default class OutputTerminal {
    private terminal: Terminal
    private emitter: EventEmitter<string>

    constructor() {
        this.emitter = new EventEmitter<string>();
        this.terminal = window.createTerminal({
            name: 'Presence Compiler',
            iconPath: new ThemeIcon('package'),
            pty: {
                open: () => null,
                close: () => commands.executeCommand("presenceCompiler.stopCompiler"),
                onDidWrite: this.emitter.event
            }
        });
        this.terminal.hide();
    }

    append(...messages: string[]): void {
        for (const message of messages)
            this.emitter.fire(message)
    }

    appendLine(...messages: string[]): void {
        for (const message of messages)
            this.append(`${message}\r\n`)
    }

    clear(): void {
        this.append('\x1bc\x1b[0J\x1b[1J\x1b[2J\x1b[3J\x1b[0;0H');
    }

    show(preserveFocus?: boolean): void {
        this.terminal.show(preserveFocus)
    }

    hide(): void {
        this.terminal.hide();
    }

    dispose(): void {
        this.terminal.dispose();
    }
}