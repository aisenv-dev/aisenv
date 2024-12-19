import * as url from 'node:url';
import type { Config } from '../api/config.js';
import type { values } from '@syuilo/aiscript';

const FILENAME = 'aisenv.config.js';

export async function resolveConfig(): Promise<Config> {
    const module = await import(url.pathToFileURL(FILENAME).toString());
    const config: Config = module.default;
    return config;
}

export function collectConsts(config: Config): Record<string, values.Value> {
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
