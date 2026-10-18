import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogue, validateCatalogue, validateExercise } from '../scripts/lib.mjs';
import { exerciseFixture } from './fixtures/exercises.mjs';
import { escapeHTML, detailPage, cataloguePage } from '../website/render.js';
const entries = await loadCatalogue();
const fixture = exerciseFixture;
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
  e.equipment = ['" onfocus="alert(1)'];
  const catalogue = cataloguePage([e], {
    lang: 'en',
    query: '',
    discipline: 'all',
    equipment: 'all',
  });
  assert(!catalogue.includes('value="" onfocus='));
});
