import { parseArgs } from 'node:util';
import { repl } from './repl/index.js';

const args = parseArgs({
    allowPositionals: true,
});

const subcommand = args.positionals[0];

switch (subcommand) {
    case 'repl':
    case undefined: {
        await repl();
        break;
    }
    default: {
        console.error(`unknown subcommand: ${subcommand}`);
        process.exit(1);
    }
}
