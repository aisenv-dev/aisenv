import { resolveConfig } from '../../common/config.js';
import { glob } from 'glob';
import { TestFileExecuted, TestFileResult } from './types.js';
import { SimpleReporter } from './reporter.js';
import { Context } from './context.js';

async function runTest(filename: string): Promise<TestFileResult> {
    const context = new Context(filename);
    const testFile = await context.prepareTestFile();
    if (testFile.state == 'error') {
        return {
            name: filename,
            result: testFile,
        };
    }
    const results = await Promise.all(testFile.children.map((testCase) => context.executeTestCase(testCase)));
    return {
        name: filename,
        result: new TestFileExecuted(results),
    };
}

export async function test() {
    const config = await resolveConfig();
    if (config.test == null) {
        throw new TypeError('test not defined');
    }
    const reporter = new SimpleReporter();
    let passed = true;
    for (const name of await glob(config.test.include)) {
        const result = await runTest(name);
        if (result.result.state != 'executed' || result.result.children.some((result) => !result.result.passed)) {
            passed = false;
        }
        reporter.onTestFinish(result);
    }
    reporter.onAllTestsFinish();
    return passed;
}
