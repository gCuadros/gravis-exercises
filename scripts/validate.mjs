import { loadCatalogue } from './lib.mjs';
const entries = await loadCatalogue();
console.log(
  `Validated ${entries.length} exercises: ${entries.filter((e) => e.status === 'published').length} published, ${entries.filter((e) => e.status === 'draft').length} drafts.`,
);
