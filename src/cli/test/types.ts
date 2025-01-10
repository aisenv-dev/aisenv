import type { values } from "@syuilo/aiscript";

export interface TestFileResult {
    name: string;
    result: TestFileExecuted | TestFileError;
};

export interface TestFileReady {
    readonly state: 'ready';
    readonly children: TestCase[];
}

export class TestFileExecuted {
    readonly state = 'executed' as const;

    readonly passed: boolean;

    constructor(public readonly children: TestCaseResult[]) {
        this.passed = children.every((result) => result.result.passed);
    }
}

export class TestFileError extends Error {
    readonly state = 'error' as const;

    constructor(message: string, cause?: unknown) {
        super(message, cause ? { cause } : undefined);
    }
}

export interface TestCase {
    readonly name: string;
    readonly err: boolean;
    readonly fn: values.VFn;
}

export interface TestCaseResult {
    readonly name: string;
    readonly result: TestResult;
}

export type TestResult = TestPassed | TestFailure;

export class TestPassed {
    public static readonly instance = new TestPassed();

    readonly passed = true as const;
}

export class TestFailure {
    readonly passed = false as const;

    public constructor(
        readonly message: string,
        readonly cause?: unknown,
    ) {}
}
