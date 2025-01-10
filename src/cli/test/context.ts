import * as fs from 'fs/promises';
import path from 'path';
import { Ast, Interpreter, Parser, utils, values } from "@syuilo/aiscript";
import { TestCase, TestCaseResult, TestFailure, TestPassed, TestResult } from './types.js';
import { TestFileError, TestFileReady } from './types.js';

export class Context {
    private readonly interpreter = new Interpreter({});

    public constructor(
        public readonly filename: string
    ) {}

    public async prepareTestFile(): Promise<TestFileReady | TestFileError> {
        try {
            return await this.collectTestCases();
        } catch (e) {
            if (e instanceof TestFileError) {
                return e;
            }
            return new TestFileError('unexpected error', e);
        }
    }

    public async executeTestCase(testCase: TestCase): Promise<TestCaseResult> {
        return {
            name: testCase.name,
            result: await this.executeTest(testCase.fn, testCase.err),
        };
    }

    private async executeTest(fn: values.VFn, shouldAbort: boolean): Promise<TestResult> {
        if (shouldAbort) {
            try {
                await this.interpreter.execFn(fn, []);
                return new TestFailure('test expected to be aborted, but was not');
            } catch {
                return TestPassed.instance;
            }
        } else {
            try {
                await this.interpreter.execFn(fn, []);
                return TestPassed.instance;
            } catch (e) {
                return new TestFailure('test was aborted', e);
            }
        }
    }

    private async parse(): Promise<Ast.Node[]> {
        const script = await fs.readFile(this.filename, 'utf8');
        try {
            return Parser.parse(script);
        } catch (e) {
            throw new TestFileError(`syntax error at "${this.filename}"`, e);
        }
    }

    private async executeImports(imports: unknown): Promise<void> {
        if (imports === undefined) {
            return;
        }

        if (!Array.isArray(imports)) {
            throw new TestFileError('imports must be an array');
        }

        const importPaths: string[] = [];
        for (const importPath of imports) {
            if (typeof importPath != 'string') {
                throw new TestFileError(`Invalid import path: ${importPath}`);
            }
            importPaths.push(importPath);
        }

        const dirname = path.dirname(this.filename);
        const importScripts = await Promise.all(
            importPaths.map(async (filename) => {
                const script = await fs.readFile(
                    path.resolve(dirname, filename),
                    'utf8',
                );
                return [filename, script] as const;
            }),
        );

        for (const [filename, script] of importScripts) {
            try {
                await this.interpreter.exec(Parser.parse(script));
            } catch (e) {
                throw new TestFileError(`error at imported "${filename}"`, e);
            }
        }
    }

    private async collectTestCases(): Promise<TestFileReady> {
        const ast = await this.parse();
        const imports: unknown = Interpreter.collectMetadata(ast)?.get('imports');
        await this.executeImports(imports);
        try {
            await this.interpreter.exec(ast);
        } catch (e) {
            throw new TestFileError(`runtime error at test file "${this.filename}"`, e);
        }
        const testCases: TestCase[] = [];
        for (const [name, { value }] of this.interpreter.scope.getAll()) {
            const testCase = this.filterTestCase(name, value);
            if (testCase != null) {
                testCases.push(testCase);
            }
        }
        return {
            state: 'ready',
            children: testCases,
        };
    }

    private filterTestCase(name: string, value: values.Value): TestCase | undefined {
        if (value.attr == null) {
            return;
        }
        for (const attr of value.attr) {
            if (attr.name != 'test') {
                throw new TestFileError(this.filename, `Unknown attribute for variable \`${name}\`: \`${attr.name}\``)
            }
            if (value.type != 'fn') {
                throw new TestFileError(this.filename, `\`${name}\` is ${value.type}, but has 'test' attribute`);
            }
            let err = false;
            if (attr.value.type == 'str') {
                if (attr.value.value == 'err') {
                    err = true;
                } else {
                    throw new TestFileError(this.filename, `Unexpected test attribute: ${attr.value}, function: \`${name}\``);
                }
            } else if (attr.value.type != 'bool' || !attr.value.value) {
                throw new TestFileError(this.filename, `Unexpected test attribute value: ${utils.reprValue(attr.value)}`);
            }
            return { name, err, fn: value };
        }
    }
}
