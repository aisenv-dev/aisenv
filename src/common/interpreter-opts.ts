import { Interpreter } from "@syuilo/aiscript";
import { AiScriptError } from "@syuilo/aiscript/error.js";
import { valToString } from "@syuilo/aiscript/interpreter/util.js";
import { Value } from "@syuilo/aiscript/interpreter/value.js";
import * as readline from 'node:readline/promises';

export type InterpreterOpts = NonNullable<ConstructorParameters<typeof Interpreter>[1]>;

export class SimpleInterpreterOpts implements InterpreterOpts {
    public readonly maxStep: number | undefined = undefined;

    public readonly abortOnError: boolean = false;

    private readonly rl: readline.Interface;

    public constructor(rl?: readline.Interface) {
        this.rl = rl ?? readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    public async in(q: string): Promise<string> {
        return this.rl.question(q);
    }

    public out(value: Value): void {
        console.log(valToString(value, true));
    }

    public err(e: AiScriptError): void {
        console.error(e);
    }

    public log(type: string, params: Record<string, any>): void {
        // do nothing
    }
}
