import { getTerm, getLabel, taxonomy } from './taxonomy.js';
export { taxonomy };
export function label(group, key, language = 'en') {
  const value = getLabel(group, key, language);
  if (value === undefined) throw new Error(`Unknown taxonomy label: ${group}/${key}/${language}`);
  return value;
}
export const normalize = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ');
export function filterExercises(
  exercises,
  { query = '', discipline = 'all', equipment = 'all' } = {},
) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return exercises.filter((e) => {
    const references = [
      ...e.equipment.map((key) => ['equipment', key]),
      ...e.disciplines.map((key) => ['disciplines', key]),
      ...[...e.muscles.primary, ...e.muscles.secondary].map((key) => ['muscles', key]),
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

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value;
}

// Each entry point owns its dataset; importing the default never loads preview data.
export function createCatalogue(data) {
  const catalogue = freezeDeep(data);
  const byId = new Map(catalogue.exercises.map((exercise) => [exercise.id, exercise]));
  const bySlug = new Map(catalogue.exercises.map((exercise) => [exercise.slug, exercise]));
  return Object.freeze({
    catalogue,
    exercises: catalogue.exercises,
    getExerciseById: (id) => byId.get(id),
    getExerciseBySlug: (slug) => bySlug.get(slug),
    findExercises: (options = {}) => Object.freeze(filterExercises(catalogue.exercises, options)),
  });
}
