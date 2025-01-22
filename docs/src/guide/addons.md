# 拡張機能

## `aisenv.config.js`
```js
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
```

## `main.ais`
```aiscript
Custom:message()
```
