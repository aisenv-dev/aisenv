import type { errors } from "@syuilo/aiscript";

export interface TestResultBase {
    success: boolean;
}

export interface TestSuccess extends TestResultBase {
    success: true;
}

export interface TestError {
    message: string;
    cause?: errors.AiScriptError;
}

export interface TestFailure extends TestResultBase {
    success: false;
    errors: TestError[];
}

export type TestResult = TestSuccess | TestFailure;
