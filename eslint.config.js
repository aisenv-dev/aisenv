import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        tseslint.configs.recommended,
        /** @type {any} */ (eslintConfigPrettier),
    ],
    languageOptions: {
        globals: {
            ...globals.node,
        },
    },
});
