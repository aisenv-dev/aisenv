import * as readline from 'node:readline/promises';
import { Interpreter, Parser, values } from '@syuilo/aiscript';
import { SimpleInterpreterOpts } from '../../common/interpreter-opts.js';
import { valToString } from '@syuilo/aiscript/interpreter/util.js';

export async function repl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const opts = new REPLInterpreterOpts(rl);
    let doNext = true;
    const interpreter = new Interpreter({
        'exit': values.FN_NATIVE((args) => {
            opts.doLog = false;
            doNext = false;
        }),
    }, opts);

    while (doNext) {
        try {
            const ast = await getAst(rl);
            await interpreter.exec(ast);
        } catch(e) {
            console.error(e);
        }
    }

    opts.close();
}

async function getAst(rl: readline.Interface) {
	const script = await rl.question('>>> ');
    return Parser.parse(script);
}

class REPLInterpreterOpts extends SimpleInterpreterOpts {
    public doLog = true;

    public override log(type: string, params: Record<string, any>): void {
        if (this.doLog && type == 'end') {
            console.log(valToString(params.val, true));
        }
    }
}
