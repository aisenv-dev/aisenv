import { Addon } from './addon.js';

export interface Config {
    addons?: Addon[];
    test?: {
        /** テストのファイル名。globパターンを使用できます。 */
        include: string[];
    };
}
