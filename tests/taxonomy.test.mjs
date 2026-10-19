import test from 'node:test';
import assert from 'node:assert/strict';
import { taxonomy, getTerm, getLabel } from '../src/taxonomy.js';
import { filterExercises, label } from '../src/catalogue.js';
import { schema, validateExercise } from '../scripts/lib.mjs';
import { assertTaxonomyContract, validateTaxonomy } from '../scripts/taxonomy-contract.mjs';
import { exerciseFixture, searchFixtures } from './fixtures/exercises.mjs';

test('vocabulary is bilingual and record enums exactly match its scoped keys', () => {
  assert.deepEqual(validateTaxonomy(taxonomy), []);
  assert.doesNotThrow(() => assertTaxonomyContract(schema));
  const drift = structuredClone(schema);
  drift.$defs.equipment.enum.push('unreviewed-equipment');
  assert.throws(() => assertTaxonomyContract(drift), /drift/);
  const missing = structuredClone(schema);
  missing.$defs.muscle.enum.pop();
  assert.throws(() => assertTaxonomyContract(missing), /drift/);
});

test('missing translations, empty definitions and ambiguous aliases are rejected', () => {
  const missing = structuredClone(taxonomy);
  delete missing.groups.equipment.band.labels.es;
  assert(validateTaxonomy(missing).some((error) => error.includes('es')));
  const empty = structuredClone(taxonomy);
  empty.groups.families.pull_up.definition.en = ' ';
  assert(validateTaxonomy(empty).some((error) => error.includes('definition/en')));
  const ambiguous = structuredClone(taxonomy);
  ambiguous.groups.equipment.bench.aliases.es.push(' BÁRRA ');
  assert(validateTaxonomy(ambiguous).some((error) => error.includes('Ambiguous equipment/es')));
  const malformed = structuredClone(taxonomy);
  malformed.groups.equipment['Unknown Key'] = malformed.groups.equipment.band;
  assert(validateTaxonomy(malformed).length);
  assert(validateTaxonomy(null).length);
});

test('unknown references are rejected in every controlled record field', () => {
  const changes = [
    (e) => {
      e.disciplines = ['unknown'];
    },
    (e) => {
      e.equipment = ['unknown'];
    },
    (e) => {
      e.muscles.primary = ['unknown'];
    },
    (e) => {
      e.muscles.secondary = ['unknown'];
    },
    (e) => {
      e.family = 'unknown';
    },
    (e) => {
      e.tracking.required = ['unknown'];
    },
    (e) => {
      e.tracking.optional = ['unknown'];
    },
  ];
  for (const change of changes) {
    const record = exerciseFixture();
    change(record);
    assert(validateExercise(record).some((error) => error.includes('allowed values')));
  }
  const alias = exerciseFixture();
  alias.equipment = ['Goma elástica'];
  assert(validateExercise(alias).length, 'Search aliases must not become stored keys');
  const overlap = exerciseFixture();
  overlap.muscles.secondary.push(overlap.muscles.primary[0]);
  assert(validateExercise(overlap).some((error) => error.includes('primary/secondary')));
});

test('group-aware labels distinguish equipment from metrics and reject silent fallback', () => {
  assert.equal(getLabel('equipment', 'band', 'es'), 'Banda elástica');
  assert.equal(getLabel('metrics', 'band', 'es'), 'Banda utilizada');
  assert.equal(getLabel('metrics', 'assistance', 'es'), 'Asistencia');
  assert.equal(getLabel('families', 'pull_up'), 'Pull-up');
  for (const key of ['missing', '__proto__', 'constructor', 'toString']) {
    assert.equal(getTerm('equipment', key), undefined);
    assert.equal(getLabel('equipment', key), undefined);
    assert.equal(getTerm(key, 'band'), undefined);
  }
  assert.equal(getLabel('equipment', 'band', 'fr'), undefined);
  assert.throws(() => label('equipment', 'missing', 'es'), /Unknown taxonomy/);
  assert.throws(() => {
    taxonomy.groups.equipment.band.labels.en = 'Changed';
  }, TypeError);
  assert.throws(() => {
    getTerm('equipment', 'band').aliases.es.push('Changed');
  }, TypeError);
});

test('search includes bilingual term aliases and families without indexing definition prose', () => {
  const fixtures = searchFixtures();
  const ids = (query) => filterExercises(fixtures, { query }).map((e) => e.id);
  assert.deepEqual(ids('goma elastica'), ['grv_test00000001', 'grv_test00000003']);
  assert.deepEqual(ids('rowing machine'), ['grv_test00000004']);
  assert.deepEqual(ids('latissimus dorsi'), [
    'grv_test00000001',
    'grv_test00000002',
    'grv_test00000003',
  ]);
  const isolated = exerciseFixture();
  isolated.names = { en: 'Test movement', es: 'Movimiento de prueba' };
  isolated.aliases = { en: [], es: [] };
  isolated.equipment = ['floor'];
  assert.deepEqual(filterExercises([isolated], { query: 'pull up' }), [isolated]);
  assert.deepEqual(ids('standardized across brands'), []);
});

test('version 1 records require an explicit migration to the controlled contract', () => {
  const old = exerciseFixture();
  old.schemaVersion = 1;
  assert(validateExercise(old).some((error) => error.includes('schemaVersion')));
});
