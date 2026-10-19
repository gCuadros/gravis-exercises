import {
  catalogue,
  exercises,
  getExerciseById,
  findExercises,
  type Exercise,
} from 'gravis-exercises';
import { exercises as drafts } from 'gravis-exercises/preview';

const entry: Exercise | undefined = getExerciseById('grv_000000000001');
const result: readonly Exercise[] = findExercises({
  discipline: 'calisthenics',
  query: 'dominada',
});
const version: string = catalogue.version;
void entry;
void result;
void version;
void drafts;
// @ts-expect-error The shared dataset is immutable.
exercises.push({});
// @ts-expect-error Unknown disciplines must be rejected by the public contract.
findExercises({ discipline: 'unknown' });
if (entry) {
  const spanish: string = entry.names.es;
  void spanish;
  // @ts-expect-error Nested content is readonly too.
  entry.names.en = 'changed';
}

import { taxonomy, getTerm, getLabel, type Term } from 'gravis-exercises/taxonomy';
const term: Term | undefined = getTerm('families', 'pull_up');
const label: string | undefined = getLabel('metrics', 'assistance', 'es');
const equipmentName: string = taxonomy.groups.equipment.band.labels.es;
void term;
void label;
void equipmentName;
findExercises({ equipment: 'band' });
// @ts-expect-error Unknown equipment is not part of the record contract.
findExercises({ equipment: 'unknown' });
// @ts-expect-error Groups are explicit namespaces.
getLabel('unknown', 'band');
// @ts-expect-error The vocabulary has no language fallback.
getLabel('equipment', 'band', 'fr');
// @ts-expect-error Taxonomy keys derive from the record schema.
taxonomy.groups.equipment.unknown;
// @ts-expect-error Vocabulary aliases are deeply readonly.
taxonomy.groups.equipment.band.aliases.es.push('changed');
if (entry) {
  // @ts-expect-error Family keys are closed, not free text.
  const family: Exercise['family'] = 'unknown';
  void family;
}
