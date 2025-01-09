import { styleText } from "util";
import { TestResult } from "./result.js";

export class SimpleReporter {
    private passedFiles = 0;

    private failedFiles = 0;

    public onTestFinish(name: string, result: TestResult): void {
        if (result.success) {
            this.passedFiles++;
            console.log(`${styleText('green', '✔')} ${name}`);
        } else {
            this.failedFiles++;
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

    public onAllTestsFinish(): void {
        console.log(`Files: ${this.passedFiles} passed | ${this.failedFiles} failed`);
    }
}
