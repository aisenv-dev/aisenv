import * as fs from 'node:fs/promises';
import { Interpreter, Parser } from '@syuilo/aiscript';
import { SimpleInterpreterOpts } from '../common/interpreter-opts.js';
import { collectConsts, resolveConfig } from '../common/config.js';

export async function run(filename: string) {
    const config = await resolveConfig();
    const opts = new SimpleInterpreterOpts();
    const interpreter = new Interpreter(collectConsts(config), opts);
    const script = await fs.readFile(filename, 'utf-8');
    const ast = Parser.parse(script);
    await interpreter.exec(ast);
    opts.close();
}
