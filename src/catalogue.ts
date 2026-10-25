import type { Exercise, SearchOptions, DeepReadonly } from './index.js';
import type { Language, TaxonomyGroup } from './taxonomy.types.ts';
import { getTerm, getLabel, taxonomy } from './taxonomy.ts';
export { taxonomy };
export function label(group: TaxonomyGroup, key: string, language: Language = 'en') {
  const value = getLabel(group, key, language);
  if (value === undefined) throw new Error(`Unknown taxonomy label: ${group}/${key}/${language}`);
  return value;
}
export const normalize = (value: unknown) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ');
export function filterExercises(
  exercises: readonly Exercise[],
  { query = '', discipline = 'all', equipment = 'all' }: SearchOptions = {},
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return exercises.filter((e) => {
    const references: [TaxonomyGroup, string][] = [
      ...e.equipment.map((key): [TaxonomyGroup, string] => ['equipment', key]),
      ...e.disciplines.map((key): [TaxonomyGroup, string] => ['disciplines', key]),
      ...[...e.muscles.primary, ...e.muscles.secondary].map((key): [TaxonomyGroup, string] => [
        'muscles',
        key,
      ]),
      ['families', e.family],
    ];
    const terms = references.flatMap(([group, key]) => {
      const term = getTerm(group, key);
      return term
        ? [key, ...Object.values(term.labels), ...term.aliases.en, ...term.aliases.es]
        : [];
    });
    const haystack = normalize(
      [e.names.en, e.names.es, ...e.aliases.en, ...e.aliases.es, ...terms].join(' '),
    );
    return (
      (discipline === 'all' || e.disciplines.includes(discipline)) &&
      (equipment === 'all' || e.equipment.includes(equipment)) &&
      words.every((w) => haystack.includes(w))
    );
  });
}

function freezeDeep<T>(value: T): DeepReadonly<T> {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}

// Each entry point owns its dataset; importing the default never loads preview data.
export function createCatalogue<T extends { exercises: readonly Exercise[] }>(data: T) {
  const catalogue = freezeDeep(data);
  const byId = new Map(catalogue.exercises.map((exercise) => [exercise.id, exercise]));
  const bySlug = new Map(catalogue.exercises.map((exercise) => [exercise.slug, exercise]));
  return Object.freeze({
    catalogue,
    exercises: catalogue.exercises,
    getExerciseById: (id: string) => byId.get(id),
    getExerciseBySlug: (slug: string) => bySlug.get(slug),
    findExercises: (options: SearchOptions = {}) =>
      Object.freeze(filterExercises(catalogue.exercises, options)),
  });
}
