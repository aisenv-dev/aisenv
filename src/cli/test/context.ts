import { Ast, errors, Interpreter, Parser, utils, values } from "@syuilo/aiscript";
import { TestError, TestResult } from "./result.js";

export class Context {
    private currentExecuting = 'root';

    private readonly interpreter = new Interpreter(
        {},
        {
            in: async () => '',
            err: (e) => this.catch(this.currentExecuting, e),
        },
    );

    private readonly errors: TestError[] = [];

    private acceptError = false;

    private acceptedError: errors.AiScriptError | undefined;

    public parse(filename: string, script: string): Ast.Node[] | undefined {
        try {
            return Parser.parse(script);
        } catch (e) {
            this.catch(`parsing ${filename}`, e);
        }
    }

    public async runScript(filename: string, script: string): Promise<void> {
        const ast = this.parse(filename, script);
        if (ast != null) {
            await this.run(filename, ast);
        }
    }

    public async run(filename: string, ast: Ast.Node[]): Promise<void> {
        await this.execute(`executing \`${filename}\``, () =>
            this.interpreter.exec(ast),
        );
    }

    public async runTestFunctions() {
        for (const [name, { value }] of this.interpreter.scope
            .getAll()
            .entries()) {
            if (value.attr == null) {
                continue;
            }
            for (const attr of value.attr) {
                if (attr.name != 'test') {
                    this.addError({
                        message: `Unknown attribute for variable \`${name}\`: \`${attr.name}\``,
                    });
                    continue;
                }
                if (value.type != 'fn') {
                    this.addError({
                        message: `\`${name}\` is ${value.type}, but has 'test' attribute`,
                    });
                    continue;
                }
                await this.runTestFunction(name, attr.value, value);
            }
        }
    }

    private async runTestFunction(
        name: string,
        attr: values.Value,
        fn: values.VFn,
    ) {
        const checkedAttr = this.checkTestAttribute(name, attr);
        if (checkedAttr == null) {
            return;
        }

        if (checkedAttr.err) {
            this.acceptError = true;
            await this.executeFunction(name, fn);
            this.acceptError = false;
            if (this.acceptedError == null) {
                this.addError({
                    message: `function \`${name}\`: Expected error `,
                });
            } else {
                this.acceptedError = undefined;
            }
        } else {
            await this.executeFunction(name, fn);
        }
    }

    private checkTestAttribute(
        fnName: string,
        attr: values.Value,
    ): { err?: boolean } | undefined {
        if (attr.type == 'bool' && attr.value) {
            return {};
        } else if (attr.type == 'str') {
            if (attr.value == 'err') {
                return { err: true };
            }
            this.addError({
                message: `Unexpected test attribute: ${attr.value}, function: \`${fnName}\``,
            });
        } else {
            this.addError({
                message: `Unexpected test attribute value: ${utils.reprValue(attr, true)}, function: \`${fnName}\``,
            });
        }
    }

    private async executeFunction(name: string, fn: values.VFn): Promise<void> {
        await this.execute(`function \`${name}\``, () =>
            this.interpreter.execFn(fn, []).then(() => {}),
        );
    }

    private async execute(
        currentExecuting: string,
        executor: () => Promise<void>,
    ) {
        try {
            this.currentExecuting = currentExecuting;
            await executor();
            this.currentExecuting = 'root';
        } catch (e) {
            this.catch(currentExecuting, e);
        }
    }

    private addError(error: TestError): void {
        this.errors.push(error);
    }

    private catch(message: string, e: unknown): void {
        if (e instanceof errors.AiScriptError) {
            if (!this.acceptError) {
                this.addError({
                    message,
                    cause: e,
                });
            } else {
                this.acceptedError = e;
            }
        } else {
            throw e;
        }
    }

    public toResult(): TestResult {
        if (this.errors.length == 0) {
            return { success: true };
        } else {
            return { success: false, errors: this.errors };
        }
    }
}
