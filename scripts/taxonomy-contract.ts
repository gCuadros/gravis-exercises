import type { Taxonomy, TaxonomyGroup } from '../src/taxonomy.types.ts';
import type { ExerciseSchema } from './lib.ts';
import { readFile } from 'node:fs/promises';
import { Ajv2020 } from './ajv.ts';
import { taxonomy } from '../src/taxonomy.ts';

export const taxonomySchema = JSON.parse(
  await readFile(new URL('../schema/taxonomy.schema.json', import.meta.url), 'utf8'),
);
const validate = new Ajv2020({ allErrors: true, strict: true }).compile<Taxonomy>(taxonomySchema);
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function validateTaxonomy(value: unknown): string[] {
  if (!validate(value))
    return (validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`);
  const errors = [];
  for (const [group, terms] of Object.entries(value.groups)) {
    for (const language of ['en', 'es'] as const) {
      const seen = new Map();
      for (const [key, term] of Object.entries(terms)) {
        if (['constructor', 'prototype'].includes(key))
          errors.push(`Reserved key: ${group}/${key}`);
        for (const name of [term.labels[language], ...term.aliases[language]]) {
          const normalized = normalize(name);
          if (seen.has(normalized))
            errors.push(
              `Ambiguous ${group}/${language} name: ${name} (${seen.get(normalized)}, ${key})`,
            );
          seen.set(normalized, key);
        }
      }
    }
  }
  return errors;
}

// Only vocabulary-controlled portions change; the record schema stays standalone.
export function schemaWithTaxonomy(schema: ExerciseSchema, value = taxonomy) {
  const next = structuredClone(schema);
  const definitions = {
    disciplines: 'discipline',
    equipment: 'equipment',
    muscles: 'muscle',
    families: 'family',
    metrics: 'metric',
  } as const;
  for (const [group, name] of Object.entries(definitions))
    next.$defs[name] = {
      type: 'string',
      enum: Object.keys(value.groups[group as TaxonomyGroup]).sort(),
    };
  const ref = (name: string) => ({ $ref: `#/$defs/${name}` });
  next.properties.disciplines.items = ref('discipline');
  next.properties.family = ref('family');
  next.properties.equipment.items = ref('equipment');
  for (const role of ['primary', 'secondary'] as const)
    next.properties.muscles.properties[role].items = ref('muscle');
  for (const role of ['required', 'optional'] as const)
    next.properties.tracking.properties[role].items = ref('metric');
  return next;
}

export function assertTaxonomyContract(schema: ExerciseSchema) {
  const errors = validateTaxonomy(taxonomy);
  if (errors.length) throw new Error(errors.join('\n'));
  if (JSON.stringify(schema) !== JSON.stringify(schemaWithTaxonomy(schema)))
    throw new Error(
      'Taxonomy/schema drift. Run npm run taxonomy:sync and review the contract change.',
    );
}
