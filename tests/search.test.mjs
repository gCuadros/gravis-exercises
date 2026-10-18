import test from 'node:test';
import assert from 'node:assert/strict';
import { filterExercises } from '../src/catalogue.js';
import { validateCatalogue } from '../scripts/lib.mjs';
import { searchFixtures } from './fixtures/exercises.mjs';
const fixtures = searchFixtures();
const ids = (options) => filterExercises(fixtures, options).map((exercise) => exercise.id);
const band = 'grv_test00000001';
const bodyweight = 'grv_test00000002';
const functional = 'grv_test00000003';
const row = 'grv_test00000004';

test('synthetic fixtures obey the actual record contract', () => {
  assert.deepEqual(validateCatalogue(fixtures), []);
});
test('search returns multiple variations, ignoring case and accents', () => {
  assert.deepEqual(ids({ query: '  DÓMINADA  ' }), [band, bodyweight, functional]);
  assert.deepEqual(ids({ query: 'ergometro' }), [row]);
  assert.deepEqual(ids({ query: 'bWpU' }), [bodyweight]);
  assert.deepEqual(ids({ query: 'traccion de prueba' }), [band]);
});
test('search matches every query word regardless of order', () => {
  assert.deepEqual(ids({ query: 'pull-up synthetic band' }), [band, functional]);
  assert.deepEqual(ids({ query: 'pull-up synthetic assisted' }), [band]);
  assert.deepEqual(ids({ query: 'pull-up ergometer' }), []);
});
test('equipment and muscle labels are searchable in both languages', () => {
  assert.deepEqual(ids({ query: 'dorsales' }), [band, bodyweight, functional]);
  assert.deepEqual(ids({ query: 'lats' }), [band, bodyweight, functional]);
  assert.deepEqual(ids({ query: 'banda elastica' }), [band, functional]);
  assert.deepEqual(ids({ query: 'resistance band' }), [band, functional]);
});
test('query, discipline and equipment combine with AND, not OR', () => {
  assert.deepEqual(ids({ query: 'dominada', discipline: 'calisthenics', equipment: 'band' }), [
    band,
  ]);
  assert.deepEqual(ids({ query: 'dominada', discipline: 'functional', equipment: 'band' }), [
    functional,
  ]);
  assert.deepEqual(ids({ query: 'ergometro', discipline: 'calisthenics' }), []);
});
test('empty search keeps all entries and unmatched queries return an empty result', () => {
  assert.deepEqual(ids({ query: '   ' }), [band, bodyweight, functional, row]);
  assert.deepEqual(ids({ query: 'no-such-fixture' }), []);
});
test('adding another matching variation preserves existing matches without mutating input', () => {
  const initial = [fixtures[0], fixtures[3]];
  const expanded = [...initial, fixtures[1]];
  const snapshot = structuredClone(expanded);
  assert.deepEqual(
    filterExercises(initial, { query: 'dominada' }).map((e) => e.id),
    [band],
  );
  assert.deepEqual(
    filterExercises(expanded, { query: 'dominada' }).map((e) => e.id),
    [band, bodyweight],
  );
  assert.deepEqual(expanded, snapshot);
});
