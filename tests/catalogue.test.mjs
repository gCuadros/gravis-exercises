import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogue, validateCatalogue, validateExercise } from '../scripts/lib.mjs';
import { exerciseFixture } from './fixtures/exercises.mjs';
import { escapeHTML, detailPage, cataloguePage } from '../website/render.js';
import { createCatalogue, filterExercises } from '../src/catalogue.js';
const entries = await loadCatalogue();
const fixture = exerciseFixture;
test('related authored variations remain distinct through discovery and identity lookup', () => {
  const api = createCatalogue({ exercises: entries });
  for (const [query, first, second] of [
    ['sentadilla', 'squat-bodyweight', 'back-squat-high-bar-barbell'],
    ['dominada', 'pull-up-strict', 'band-assisted-pull-up'],
    ['press banca', 'bench-press-dumbbell', 'bench-press-barbell'],
  ]) {
    const a = api.getExerciseBySlug(first);
    const b = api.getExerciseBySlug(second);
    assert(a && b);
    assert.notEqual(a.id, b.id);
    const ids = api.findExercises({ query }).map((entry) => entry.id);
    assert(ids.includes(a.id) && ids.includes(b.id));
    assert.equal(api.getExerciseById(a.id), a);
    assert.notDeepEqual(a.tracking, b.tracking);
  }
  const dumbbells = api.findExercises({ query: 'press banca', equipment: 'dumbbell' });
  assert(dumbbells.some((entry) => entry.slug === 'bench-press-dumbbell'));
  assert(!dumbbells.some((entry) => entry.slug === 'bench-press-barbell'));
});
test('plank and planche discovery preserves their different support families', () => {
  const matches = filterExercises(entries, { query: 'plancha' });
  const plank = matches.find((entry) => entry.slug === 'plank-forearms');
  const planche = matches.find((entry) => entry.slug === 'tuck-planche-parallettes');
  assert(plank && planche);
  assert.equal(plank.family, 'plank');
  assert.equal(planche.family, 'planche');
  assert(plank.tracking.required.includes('duration'));
  assert(!plank.tracking.required.includes('repetitions'));
  const floor = filterExercises(matches, { equipment: 'floor' });
  assert(floor.includes(plank));
  assert(!floor.includes(planche));
});
test('authored records have unique identities and no private source fields', () => {
  assert(entries.length > 0);
  assert.deepEqual(validateCatalogue(entries), []);
  for (const e of entries) assert.equal(e.provenance.kind, 'gravis-authored');
  const duplicate = structuredClone(entries[0]);
  assert(validateCatalogue([...entries, duplicate]).some((e) => e.includes('Duplicate')));
});
test('missing translation, duplicate tracking metrics and source injection fail validation', () => {
  const a = fixture();
  delete a.instructions.es;
  assert(validateExercise(a).length);
  const b = fixture();
  b.tracking.optional.push(b.tracking.required[0]);
  assert(validateExercise(b).some((x) => x.includes('repeated')));
  const c = fixture();
  c.hevy_account_id = 'private';
  assert(validateExercise(c).some((x) => x.includes('additional properties')));
});
test('approval without reviewer or demonstration does not release a draft', () => {
  const e = fixture();
  e.status = 'published';
  assert(validateExercise(e).some((x) => x.includes('technical')));
  e.review.technical = 'approved';
  assert(validateExercise(e).some((x) => x.includes('reviewer')));
  e.review.reviewer = 'Test reviewer';
  e.review.reviewedAt = '2026-10-18';
  assert(validateExercise(e).some((x) => x.includes('media')));
  e.media = [
    {
      type: 'video',
      url: 'https://example.com/exercise-v1.mp4',
      alt: { en: 'Test movement', es: 'Movimiento de prueba' },
      license: 'CC-BY-4.0',
      creator: 'Test creator',
      reviewStatus: 'approved',
    },
  ];
  assert.deepEqual(validateExercise(e), []);
  e.media[0].url = 'https://';
  assert(validateExercise(e).some((x) => x.includes('url')));
  e.media[0].url = 'https://example.com/exercise-v1.mp4';
  e.media[0].license = '';
  assert(validateExercise(e).some((x) => x.includes('license')));
});
test('invalid calendar dates and unsafe slugs fail', () => {
  const e = fixture();
  e.review.reviewedAt = '2026-02-30';
  assert(validateExercise(e).some((x) => x.includes('date')));
  e.slug = '../private';
  assert(validateExercise(e).some((x) => x.includes('slug')));
});
test('malformed records and media return errors instead of throwing', () => {
  assert(validateCatalogue([null]).length);
  const e = fixture();
  e.media = [null];
  e.status = 'published';
  assert(validateExercise(e).length);
});
test('authored strings are escaped in HTML', () => {
  assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
  const e = fixture();
  e.names.en = '<img src=x onerror=alert(1)>';
  const html = detailPage(e, 'en');
  assert(!html.includes('<img src=x'));
  assert(html.includes('&lt;img'));
  const catalogue = cataloguePage([e], {
    lang: 'en',
    query: '',
    discipline: 'all',
    equipment: 'all',
  });
  assert(!catalogue.includes('<img src=x'));
  assert(catalogue.includes('&lt;img'));
  e.equipment = ['" onfocus="alert(1)'];
  assert.throws(
    () =>
      cataloguePage([e], {
        lang: 'en',
        query: '',
        discipline: 'all',
        equipment: 'all',
      }),
    /Unknown taxonomy/,
  );
});

test('rowing discovery separates resistance variants from the ergometer', () => {
  const api = createCatalogue({ exercises: entries });
  const rows = api.findExercises({ query: 'remo' });
  const ring = api.getExerciseBySlug('ring-row');
  const bar = api.getExerciseBySlug('bent-over-row-barbell');
  const erg = api.getExerciseBySlug('rowing-ergometer');
  for (const e of [ring, bar, erg]) assert(rows.includes(e));
  assert.equal(new Set([ring.id, bar.id, erg.id]).size, 3);
  assert.equal(ring.family, 'horizontal_row');
  assert.equal(bar.family, 'horizontal_row');
  assert.equal(erg.family, 'ergometer_row');
  const filtered = api.findExercises({ query: 'remo', equipment: 'rings' });
  assert(filtered.includes(ring));
  assert(!filtered.includes(bar) && !filtered.includes(erg));
});

test('chin-up discovery preserves supinated, pronated and assisted identities', () => {
  const api = createCatalogue({ exercises: entries });
  const matches = api.findExercises({ query: 'dominada' });
  const variations = ['chin-up-strict', 'pull-up-strict', 'band-assisted-pull-up'].map((slug) =>
    api.getExerciseBySlug(slug),
  );
  assert.equal(new Set(variations.map((e) => e.id)).size, 3);
  for (const e of variations) {
    assert(matches.includes(e));
    assert.equal(api.getExerciseById(e.id), e);
  }
  const supinated = api.findExercises({ query: 'dominada supina' });
  assert(supinated.includes(variations[0]));
  assert(!supinated.includes(variations[1]) && !supinated.includes(variations[2]));
});

test('carry consumers receive distance and single-load conventions instead of repetitions', () => {
  const api = createCatalogue({ exercises: entries });
  const carry = api
    .findExercises({ query: 'maleta', equipment: 'dumbbell' })
    .find((e) => e.slug === 'suitcase-carry-dumbbell');
  assert(carry);
  assert.deepEqual(carry.tracking.required, ['load', 'distance']);
  assert.deepEqual(carry.tracking.optional, ['duration']);
  assert.equal(carry.tracking.loadConvention, 'external_load');
  const press = api.getExerciseBySlug('bench-press-dumbbell');
  assert(press.tracking.required.includes('repetitions'));
  assert(!press.tracking.required.includes('distance'));
  for (const lang of ['en', 'es']) {
    const html = detailPage(carry, lang);
    assert(html.includes(escapeHTML(carry.tracking.notes[lang])));
    assert(!html.includes('<video'));
  }
});
