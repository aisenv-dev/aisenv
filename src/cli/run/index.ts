import * as fs from 'node:fs/promises';
import { Interpreter, Parser, values } from '@syuilo/aiscript';
import { SimpleInterpreterOpts } from '../../common/interpreter-opts.js';
import { resolveConfig } from '../../common/config.js';
import { Config } from '../../api/config.js';

export async function run(filename: string) {
    const config = await resolveConfig();
    const opts = new SimpleInterpreterOpts();
    const interpreter = new Interpreter(collectConsts(config), opts);
    const script = await fs.readFile(filename, 'utf-8');
    const ast = Parser.parse(script);
    await interpreter.exec(ast);
    opts.close();
}

function collectConsts(config: Config): Record<string, values.Value> {
    const addons = config.addons;
    if (addons == null || addons.length == 0) {
        return {};
    }
    const consts: Record<string, values.Value> = {};
    for (const addon of addons) {
        Object.assign(consts, addon.consts);
    }
    return consts;
}
