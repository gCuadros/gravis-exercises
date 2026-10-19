import { readFile } from 'node:fs/promises';
import { createDistribution } from './catalogue-contract.mjs';
import { loadCatalogue } from './lib.mjs';
const entries = await loadCatalogue();
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
createDistribution(entries, version);
console.log(
  `Validated preview/published envelopes and ${entries.length} exercises: ${entries.filter((e) => e.status === 'published').length} published, ${entries.filter((e) => e.status === 'draft').length} drafts.`,
);
