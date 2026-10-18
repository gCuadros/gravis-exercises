import type { Exercise as ExerciseModel } from './exercise.generated.js';

type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export type Exercise = DeepReadonly<ExerciseModel>;
export type Discipline = Exercise['disciplines'][number];
export interface Catalogue {
  readonly schemaVersion: 1;
  readonly version: string;
  readonly channel: 'published' | 'preview';
  readonly license: 'MIT';
  readonly exercises: readonly Exercise[];
}
export interface SearchOptions {
  /** Matches all query words across both languages, aliases, equipment and muscles. */
  query?: string;
  discipline?: Discipline | 'all';
  equipment?: string;
}
export declare const catalogue: Catalogue;
export declare const exercises: readonly Exercise[];
export declare function getExerciseById(id: string): Exercise | undefined;
export declare function getExerciseBySlug(slug: string): Exercise | undefined;
export declare function findExercises(options?: SearchOptions): readonly Exercise[];
