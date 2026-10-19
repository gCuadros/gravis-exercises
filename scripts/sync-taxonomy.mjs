import { readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';
import { taxonomy } from '../src/taxonomy.js';
import { schemaWithTaxonomy, validateTaxonomy } from './taxonomy-contract.mjs';

const errors = validateTaxonomy(taxonomy);
if (errors.length) throw new Error(errors.join('\n'));
const file = new URL('../schema/exercise.schema.json', import.meta.url);
const schema = JSON.parse(await readFile(file, 'utf8'));
await writeFile(
  file,
  await format(JSON.stringify(schemaWithTaxonomy(schema)), { parser: 'json', printWidth: 100 }),
);
console.log('Updated record taxonomy enums. Review version/migration impact before committing.');
