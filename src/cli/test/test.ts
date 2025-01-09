import * as fs from 'fs/promises';
import { Interpreter } from '@syuilo/aiscript';
import path from 'path';
import { styleText } from 'node:util';
import { resolveConfig } from '../../common/config.js';
import { glob } from 'glob';
import { Context } from './context.js';
import { TestResult } from './result.js';

async function runTest(filename: string): Promise<TestResult> {
    const context = new Context();

    const dirname = path.dirname(filename);
    const script = await fs.readFile(filename, 'utf8');
    const ast = context.parse(filename, script);
    if (ast == null) {
        return context.toResult();
    }

    const imports: unknown = Interpreter.collectMetadata(ast)?.get('imports');
    if (imports !== undefined) {
        if (!Array.isArray(imports)) {
            return {
                success: false,
                errors: [{ message: 'imports must be an array' }],
            };
        }

        const importPaths: string[] = [];
        for (const importPath of imports) {
            if (typeof importPath != 'string') {
                return {
                    success: false,
                    errors: [{ message: `Invalid import path: ${filename}` }],
                };
            }
            importPaths.push(importPath);
        }

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
            await context.runScript(filename, script);
        }
    }

    await context.run(filename, ast);
    await context.runTestFunctions();

    return context.toResult();
}

export async function test() {
    const config = await resolveConfig();
    if (config.test == null) {
        throw new TypeError('test not defined');
    }
    let passed = true;
    for (const name of await glob(config.test.include)) {
        const result = await runTest(name);
        if (result.success) {
            console.log(`${styleText('green', '✔')} ${name}`);
        } else {
            passed = false;
            console.log(`${styleText('red', '✘')} ${name}`);
            for (const error of result.errors) {
                if (error.cause != null) {
                    console.log(
                        styleText(
                            'red',
                            `  • ${error.message}:\n    ${error.cause}`,
                        ),
                    );
                } else {
                    console.log(styleText('red', `  • ${error.message}`));
                }
            }
        }
    }
    return passed;
}
