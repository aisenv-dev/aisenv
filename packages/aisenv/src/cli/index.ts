#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { repl } from './repl.js';
import { run } from './run.js';
import { test } from './test/test.js';

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
    case 'run': {
        const filename = args.positionals[1];
        if (filename == null) {
            console.error('filename expected');
            process.exit(2);
        }
        await run(filename);
        break;
    }
    case 'test': {
        const result = await test();
        if (!result) {
            process.exit(1);
        }
        break;
    }
    default: {
        console.error(`unknown subcommand: ${subcommand}`);
        process.exit(1);
    }
}
