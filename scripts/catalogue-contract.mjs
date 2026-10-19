import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { schema, validateCatalogue } from './lib.mjs';

export const envelopeSchema = JSON.parse(
  await readFile(new URL('../schema/catalogue.schema.json', import.meta.url), 'utf8'),
);

// Bundle the canonical record once and rebase its local references. Consumers
// receive a self-contained schema; no filesystem or network resolver is needed.
export function bundleCatalogueSchema(envelope, exercise) {
  const rewrite = (value, record) => {
    if (Array.isArray(value)) return value.map((item) => rewrite(item, record));
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => {
        if (key !== '$ref') return [key, rewrite(child, record)];
        if (record && child.startsWith('#/')) return [key, `#/$defs/exercise/${child.slice(2)}`];
        if (!record && child === 'exercise.schema.json') return [key, '#/$defs/exercise'];
        if (!record && child.startsWith('exercise.schema.json#/'))
          return [key, `#/$defs/exercise/${child.slice('exercise.schema.json#/'.length)}`];
        // A future schema dependency needs a deliberate bundling decision.
        throw new Error(`Unsupported catalogue schema reference: ${child}`);
      }),
    );
  };
  const bundled = rewrite(envelope, false);
  if (bundled.$defs?.exercise) throw new Error('Reserved bundled definition: exercise');
  bundled.$defs = { ...bundled.$defs, exercise: rewrite(exercise, true) };
  return bundled;
}

export const catalogueSchema = bundleCatalogueSchema(envelopeSchema, schema);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(catalogueSchema);

export function validateEnvelope(data) {
  if (!validateSchema(data))
    return validateSchema.errors.map((error) => `${error.instancePath || '/'} ${error.message}`);
  // Selected-property uniqueness and cross-field muscle/metric overlap are
  // domain checks, kept outside the portable structural schema.
  return validateCatalogue(data.exercises, { allowEmpty: true });
}

export function createDistribution(exercises, version) {
  const preview = {
    schemaVersion: schema.properties.schemaVersion.const,
    version,
    channel: 'preview',
    license: schema.properties.license.const,
    exercises,
  };
  const errors = validateEnvelope(preview);
  if (errors.length) throw new Error(`Invalid preview catalogue:\n${errors.join('\n')}`);
  const published = {
    ...preview,
    channel: 'published',
    exercises: exercises.filter((exercise) => exercise.status === 'published'),
  };
  const publishedErrors = validateEnvelope(published);
  if (publishedErrors.length)
    throw new Error(`Invalid published catalogue:\n${publishedErrors.join('\n')}`);
  return { published, preview };
}
