import { styleText } from "util";
import { TestFileResult } from "./types.js";

const TEXT_CHECK = styleText('green', styleText('bold', '🗸'));
const TEXT_CROSS = styleText('red', styleText('bold', '✗'));

export class SimpleReporter {
    private passedFiles = 0;

    private failedFiles = 0;

    private passedCases = 0;

    private failedCases = 0;

    public onTestFinish({ name, result }: TestFileResult): void {
        if (result.state == 'error') {
            this.failedFiles++;
            console.log(`${TEXT_CROSS} ${name}`);
            console.log(`  ${styleText('red', `${result.message}`)}`);
            if (result.cause != null) {
                console.log(styleText('red', `  ${result.cause}`));
            }
            return;
        }

        const caseCount = styleText('gray', `(${result.children.length})`);

        if (result.passed) {
            this.passedFiles++;
            this.passedCases += result.children.length;
            console.log(`${TEXT_CHECK} ${name} ${caseCount}`);
            return;
        }

        this.failedFiles++;
        console.log(`${TEXT_CROSS} ${name} ${caseCount}`);

        for (const { name: caseName, result: caseResult } of result.children) {
            if (caseResult.passed) {
                this.passedCases++;
                console.log(`  ${TEXT_CHECK} ${caseName}`);
            } else {
                this.failedCases++;
                console.log(`  ${TEXT_CROSS} ${caseName}`);
                console.log(`    ${styleText('red', `${caseResult.message}`)}`)
                if (caseResult.cause != null) {
                    console.log(styleText('red', `    ${caseResult.cause}`));
                }
            }
        }
    }

    public onAllTestsFinish(): void {
        console.log(`Files: ${this.passedFiles} passed | ${this.failedFiles} failed`);
        console.log(`Cases: ${this.passedCases} passed | ${this.failedCases} failed`);
    }
}
