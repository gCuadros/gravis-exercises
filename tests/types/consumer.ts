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
