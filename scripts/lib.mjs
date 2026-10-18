import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const schema = JSON.parse(
  await readFile(new URL('../schema/exercise.schema.json', import.meta.url), 'utf8'),
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

export function validateExercise(exercise) {
  if (!validateSchema(exercise)) {
    return validateSchema.errors.map(
      (error) =>
        `${error.instancePath || '/'} ${error.message}${error.params.additionalProperty ? `: ${error.params.additionalProperty}` : ''}`,
    );
  }
  const errors = [];
  const metrics = [...exercise.tracking.required, ...exercise.tracking.optional];
  if (new Set(metrics).size !== metrics.length)
    errors.push('Tracking metrics must not be repeated across required/optional');
  for (const media of exercise.media) {
    try {
      const url = new URL(media.url);
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password)
        errors.push('Media url must be HTTPS with a hostname and no credentials');
    } catch {
      errors.push('Invalid media url');
    }
  }
  return errors;
}

export function validateCatalogue(exercises) {
  if (!Array.isArray(exercises) || !exercises.length) return ['Source catalogue must not be empty'];
  const errors = [],
    ids = new Set(),
    slugs = new Set();
  for (const exercise of exercises) {
    errors.push(
      ...validateExercise(exercise).map((message) => `${exercise?.slug || 'unknown'}: ${message}`),
    );
    if (!exercise || typeof exercise !== 'object') continue;
    if (ids.has(exercise.id)) errors.push(`Duplicate id: ${exercise.id}`);
    if (slugs.has(exercise.slug)) errors.push(`Duplicate slug: ${exercise.slug}`);
    ids.add(exercise.id);
    slugs.add(exercise.slug);
  }
  return errors;
}

export async function loadCatalogue() {
  const dir = path.join(root, 'exercises');
  const files = (await readdir(dir)).filter((file) => file.endsWith('.json')).sort();
  const entries = await Promise.all(
    files.map(async (file) => {
      const exercise = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
      if (file !== `${exercise?.slug}.json`)
        throw new Error(`Filename does not match slug: ${file}`);
      return exercise;
    }),
  );
  const errors = validateCatalogue(entries);
  if (errors.length) throw new Error(errors.join('\n'));
  return entries;
}
