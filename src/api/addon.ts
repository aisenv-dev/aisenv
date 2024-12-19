import { values } from '@syuilo/aiscript';

export interface Addon {
    name: string;
    consts: Record<string, values.Value>;
}
