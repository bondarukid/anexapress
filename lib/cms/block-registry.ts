/**
 * Registry for custom React content blocks (phase 3).
 * Editor extensions and public renderers resolve blocks by slug from here.
 */
export const BLOCK_REGISTRY = {} as const;

export type BlockRegistryKey = keyof typeof BLOCK_REGISTRY;
