import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogue } from '../src/catalogue.js';
import { validateExercise } from '../scripts/lib.mjs';
import { searchFixtures } from './fixtures/exercises.mjs';
const entries = searchFixtures();
const make = () =>
  createCatalogue({
    schemaVersion: 1,
    version: '0.1.0',
    channel: 'preview',
    license: 'MIT',
    exercises: structuredClone(entries),
  });

test('lookups use stable identities and never return a fallback for unknown values', () => {
  const api = make();
  assert.equal(api.getExerciseById(entries[0].id), api.getExerciseBySlug(entries[0].slug));
  assert.equal(api.getExerciseById('missing'), undefined);
  assert.equal(api.getExerciseBySlug('__proto__'), undefined);
});
test('consumer mutation cannot corrupt shared catalogue, nested arrays or search results', () => {
  const api = make();
  assert.throws(() => {
    api.exercises[0].instructions.es.push('injected');
  }, TypeError);
  assert.throws(() => {
    api.findExercises().pop();
  }, TypeError);
  assert.equal(api.getExerciseById(entries[0].id).names.en, entries[0].names.en);
});
test('empty published channels are valid consumers', () => {
  const api = createCatalogue({ exercises: [], channel: 'published' });
  assert.deepEqual(api.findExercises({ query: 'press' }), []);
  assert.equal(api.getExerciseById(entries[0].id), undefined);
});
test('schema rejects blank translations, duplicate equipment and unapproved publication', () => {
  const blank = structuredClone(entries[0]);
  blank.names.es = '   ';
  assert(validateExercise(blank).length);
  const duplicate = structuredClone(entries[0]);
  duplicate.equipment.push(duplicate.equipment[0]);
  assert(validateExercise(duplicate).length);
  const published = structuredClone(entries[0]);
  published.status = 'published';
  assert(validateExercise(published).length);
});
