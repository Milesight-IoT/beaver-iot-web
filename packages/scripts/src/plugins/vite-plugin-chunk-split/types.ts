import { GetManualChunk } from 'rollup';

type packageInfo = string | RegExp;

type Strategy = 'default' | 'all-in-one' | 'single-vendor' | 'unbundle';

export type CustomSplitting = Record<string, packageInfo[]>;

export type CustomChunk = (
    context: {
        id: string;
        moduleId: string;
        file: string;
        root: string;
    },
    meta: Parameters<GetManualChunk>[1],
) => string | undefined | null;

export interface ChunkSplit {
    strategy?: Strategy;
    customSplitting?: CustomSplitting;
    customChunk?: CustomChunk;
}
