import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { schema, validateCatalogue } from '../scripts/lib.mjs';
import {
  envelopeSchema,
  catalogueSchema,
  bundleCatalogueSchema,
  validateEnvelope,
  createDistribution,
} from '../scripts/catalogue-contract.mjs';
import { exerciseFixture } from './fixtures/exercises.mjs';

const envelope = (exercises = [], channel = 'preview') => ({
  schemaVersion: 2,
  version: '0.2.1',
  channel,
  license: 'MIT',
  exercises,
});
// Synthetic evidence exercises the gate; it is never authored/public content.
const approvedFixture = () => ({
  ...exerciseFixture(),
  id: 'grv_test00000009',
  slug: 'synthetic-approved-movement',
  status: 'published',
  review: { technical: 'approved', reviewer: 'Synthetic test reviewer', reviewedAt: '2026-10-19' },
  media: [
    {
      type: 'video',
      url: 'https://example.com/synthetic.mp4',
      alt: { en: 'Test demonstration', es: 'Demostración de prueba' },
      license: 'CC-BY-4.0',
      creator: 'Synthetic test creator',
      reviewStatus: 'approved',
    },
  ],
});

test('both channels accept empty collections while source authoring still requires records', () => {
  assert.deepEqual(validateEnvelope(envelope()), []);
  assert.deepEqual(validateEnvelope(envelope([], 'published')), []);
  assert(validateCatalogue([]).length);
  assert.deepEqual(createDistribution([], '0.2.1'), {
    published: envelope([], 'published'),
    preview: envelope(),
  });
});

test('envelope rejects missing, unknown and wrongly typed metadata without coercion', () => {
  for (const key of ['schemaVersion', 'version', 'channel', 'license', 'exercises']) {
    const value = envelope();
    delete value[key];
    assert(validateEnvelope(value).length, `Missing ${key}`);
  }
  for (const change of [
    { schemaVersion: 1 },
    { schemaVersion: '2' },
    { version: 2 },
    { channel: 'all' },
    { license: 'CC0' },
    { exercises: {} },
    { private_account: 'forbidden' },
  ])
    assert(validateEnvelope({ ...envelope(), ...change }).length);
  for (const value of [null, [], 'catalogue', undefined]) assert(validateEnvelope(value).length);
  const value = { ...envelope(), schemaVersion: '2' };
  validateEnvelope(value);
  assert.equal(value.schemaVersion, '2');
});

test('distribution versions accept SemVer and reject incomplete or leading-zero versions', () => {
  for (const version of ['0.2.1', '1.0.0', '1.2.3-rc.1', '1.2.3-alpha.0+build.001'])
    assert.deepEqual(validateEnvelope({ ...envelope(), version }), [], version);
  for (const version of ['', 'v0.2.1', '1.2', '01.2.3', '1.2.3-01', '1.2.3+', '1.2.3\n'])
    assert(validateEnvelope({ ...envelope(), version }).length, version);
});

test('published channel rejects drafts and retains all record publication requirements', () => {
  const draft = exerciseFixture(),
    approved = approvedFixture();
  assert.deepEqual(validateEnvelope(envelope([draft, approved])), []);
  assert.deepEqual(validateEnvelope(envelope([approved], 'published')), []);
  assert(validateEnvelope(envelope([draft, approved], 'published')).length);
  const unreviewed = { ...draft, status: 'published' };
  for (const channel of ['preview', 'published'])
    assert(validateEnvelope(envelope([unreviewed], channel)).length);
  approved.media[0].reviewStatus = 'pending';
  assert(validateEnvelope(envelope([approved], 'published')).length);
});

test('canonical record refs enforce taxonomy, translations, dates and record versions', () => {
  const changes = [
    (e) => {
      e.equipment = ['unknown'];
    },
    (e) => {
      delete e.names.es;
    },
    (e) => {
      e.review.reviewedAt = '2026-02-30';
    },
    (e) => {
      e.schemaVersion = 1;
    },
  ];
  for (const change of changes) {
    const record = exerciseFixture();
    change(record);
    assert(validateEnvelope(envelope([record])).length);
  }
});

test('envelope domain validation rejects duplicate identities and cross-field conflicts', () => {
  const original = exerciseFixture();
  const duplicateId = { ...exerciseFixture(), slug: 'another-slug' };
  assert(
    validateEnvelope(envelope([original, duplicateId])).some((error) =>
      error.includes('Duplicate id'),
    ),
  );
  const duplicateSlug = { ...exerciseFixture(), id: 'grv_test00000008' };
  assert(
    validateEnvelope(envelope([original, duplicateSlug])).some((error) =>
      error.includes('Duplicate slug'),
    ),
  );
  const overlap = exerciseFixture();
  overlap.muscles.secondary.push(overlap.muscles.primary[0]);
  assert(
    validateEnvelope(envelope([overlap])).some((error) => error.includes('primary/secondary')),
  );
  const metrics = exerciseFixture();
  metrics.tracking.optional.push(metrics.tracking.required[0]);
  assert(
    validateEnvelope(envelope([metrics])).some((error) => error.includes('required/optional')),
  );
});

test('distribution validates before filtering, keeps preview complete and does not mutate input', () => {
  const records = [exerciseFixture(), approvedFixture()];
  const before = structuredClone(records);
  const distribution = createDistribution(records, '0.2.1');
  assert.deepEqual(distribution.preview, envelope(records));
  assert.deepEqual(distribution.published, envelope([records[1]], 'published'));
  assert.deepEqual(records, before);
  assert.throws(() => createDistribution([null], '0.2.1'), /Invalid preview/);
  assert.throws(() => createDistribution(records, 'broken'), /Invalid preview/);
});

test('standalone schema matches source refs using a fresh offline validator', () => {
  const standalone = new Ajv2020({ strict: true });
  addFormats(standalone);
  const validateBundled = standalone.compile(catalogueSchema);
  const source = new Ajv2020({ strict: true });
  addFormats(source);
  source.addSchema(schema, 'exercise.schema.json');
  const validateSource = source.compile(envelopeSchema);
  const cases = [
    envelope(),
    envelope([exerciseFixture()]),
    envelope([approvedFixture()], 'published'),
    envelope([exerciseFixture()], 'published'),
    { ...envelope(), license: 'unknown' },
    envelope([{ ...exerciseFixture(), equipment: ['invalid'] }]),
  ];
  for (const value of cases) assert.equal(validateBundled(value), validateSource(value));
  assert.equal(
    catalogueSchema.$defs.exercise.properties.schemaVersion.const,
    schema.properties.schemaVersion.const,
  );
  assert.throws(
    () => bundleCatalogueSchema({ $ref: 'https://example.com/remote.json' }, schema),
    /Unsupported/,
  );
});
