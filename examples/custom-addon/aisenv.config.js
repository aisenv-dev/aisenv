import { values } from 'aisenv';

/** @type {import('aisenv').Config} */
export default ({
    addons: [{
        name: 'custom',
        consts: {
            'Custom:message': values.FN_NATIVE(() => {
                console.log('Hello, world!');
            }),
        },
    }],
});
