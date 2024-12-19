import * as url from 'node:url';
import type { Config } from '../api/config.js';

const FILENAME = 'aisenv.config.js';

export async function resolveConfig(): Promise<Config> {
    const { default: config } = await import(url.pathToFileURL(FILENAME).toString());
    return config;
}
