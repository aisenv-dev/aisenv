import * as fs from 'node:fs/promises';
import { Interpreter, Parser } from "@syuilo/aiscript";
import { SimpleInterpreterOpts } from "../common/interpreter-opts.js";

export async function run(filename: string) {
    const opts = new SimpleInterpreterOpts()
    const interpreter = new Interpreter({}, opts);
    const script = await fs.readFile(filename, 'utf-8');
    const ast = Parser.parse(script);
    await interpreter.exec(ast);
    opts.close();
}
