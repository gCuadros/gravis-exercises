import type { Exercise } from './index.js';

export type Language = 'en' | 'es';
export interface Term {
  readonly labels: Readonly<Record<Language, string>>;
  readonly definition: Readonly<Record<Language, string>>;
  readonly aliases: Readonly<Record<Language, readonly string[]>>;
}
export interface TaxonomyKeys {
  disciplines: Exercise['disciplines'][number];
  equipment: Exercise['equipment'][number];
  muscles: Exercise['muscles']['primary'][number];
  families: Exercise['family'];
  metrics: Exercise['tracking']['required'][number];
}
export type TaxonomyGroup = keyof TaxonomyKeys;
export interface Taxonomy {
  readonly schemaVersion: 1;
  readonly groups: {
    readonly [Group in TaxonomyGroup]: Readonly<Record<TaxonomyKeys[Group], Term>>;
  };
}
export declare const taxonomy: Taxonomy;
/** Lookup only; aliases do not automatically resolve to canonical keys. */
export declare function getTerm(group: TaxonomyGroup, key: string): Term | undefined;
/** Returns undefined for unknown keys; no language or key fallback. */
export declare function getLabel(
  group: TaxonomyGroup,
  key: string,
  language?: Language,
): string | undefined;
