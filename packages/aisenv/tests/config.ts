import { expect, test } from 'vitest';
import { Config, values } from '../src/index.js';
import { collectConsts } from '../src/common/config.js';

test('collectConsts', () => {
    const config: Config = {
        addons: [
            { name: 'zero', consts: { ZERO: values.NUM(0) } },
            { name: 'one', consts: { ONE: values.NUM(1) } },
        ],
    };
    const consts = collectConsts(config);
    expect(consts).toStrictEqual({
        ZERO: values.NUM(0),
        ONE: values.NUM(1),
    });
});
