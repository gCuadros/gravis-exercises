import type { Catalogue } from '../src/index.js';
import type { ExerciseSchema } from './lib.ts';
type SchemaObject = Record<string, unknown> & { $defs?: Record<string, unknown> };
import { readFile } from 'node:fs/promises';
import { Ajv2020, addFormats } from './ajv.ts';
import { schema, validateCatalogue } from './lib.ts';

export const envelopeSchema = JSON.parse(
  await readFile(new URL('../schema/catalogue.schema.json', import.meta.url), 'utf8'),
);

// Bundle the canonical record once and rebase its local references. Consumers
// receive a self-contained schema; no filesystem or network resolver is needed.
export function bundleCatalogueSchema(envelope: SchemaObject, exercise: ExerciseSchema) {
  const rewrite = (value: unknown, record: boolean): unknown => {
    if (Array.isArray(value)) return value.map((item) => rewrite(item, record));
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => {
        if (key !== '$ref') return [key, rewrite(child, record)];
        if (typeof child !== 'string') throw new Error('Schema reference must be a string');
        if (record && child.startsWith('#/')) return [key, `#/$defs/exercise/${child.slice(2)}`];
        if (!record && child === 'exercise.schema.json') return [key, '#/$defs/exercise'];
        if (!record && child.startsWith('exercise.schema.json#/'))
          return [key, `#/$defs/exercise/${child.slice('exercise.schema.json#/'.length)}`];
        // A future schema dependency needs a deliberate bundling decision.
        throw new Error(`Unsupported catalogue schema reference: ${child}`);
      }),
    );
  };
  const bundled = rewrite(envelope, false) as SchemaObject;
  if (bundled.$defs?.exercise) throw new Error('Reserved bundled definition: exercise');
  return {
    ...bundled,
    $defs: { ...bundled.$defs, exercise: rewrite(exercise, true) as ExerciseSchema },
  };
}

export const catalogueSchema = bundleCatalogueSchema(envelopeSchema, schema);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile<Catalogue>(catalogueSchema);

export function validateEnvelope(data: unknown): string[] {
  if (!validateSchema(data))
    return (validateSchema.errors ?? []).map(
      (error) => `${error.instancePath || '/'} ${error.message}`,
    );
  // Selected-property uniqueness and cross-field muscle/metric overlap are
  // domain checks, kept outside the portable structural schema.
  return validateCatalogue(data.exercises, { allowEmpty: true });
}

export function createDistribution(exercises: unknown, version: string) {
  const preview = {
    schemaVersion: schema.properties.schemaVersion.const,
    version,
    channel: 'preview' as const,
    license: schema.properties.license.const,
    exercises,
  };
  const errors = validateEnvelope(preview);
  if (errors.length) throw new Error(`Invalid preview catalogue:\n${errors.join('\n')}`);
  const valid = preview as Catalogue;
  const published: Catalogue = {
    ...valid,
    channel: 'published',
    exercises: valid.exercises.filter((exercise) => exercise.status === 'published'),
  };
  const publishedErrors = validateEnvelope(published);
  if (publishedErrors.length)
    throw new Error(`Invalid published catalogue:\n${publishedErrors.join('\n')}`);
  return { published, preview: valid };
}
