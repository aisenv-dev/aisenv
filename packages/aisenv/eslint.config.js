import { config } from 'typescript-eslint';
import rootConfig from '../../eslint.config.js';

export default config({
    files: ['src/**/*.ts'],
    extends: rootConfig,
});
