import type { Exercise } from '../src/index.js';
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { loadCatalogue, root } from './lib.ts';
import { taxonomy } from '../src/taxonomy.ts';
import { buildLibrary } from './build-library.ts';
import { cataloguePage, detailPage, escapeHTML as E } from '../website/render.ts';
const exercises = await loadCatalogue();
await rm(path.join(root, 'dist'), { recursive: true, force: true });
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
await buildLibrary(exercises, version);
const dist = path.join(root, 'dist/site');
for (const dir of ['assets', 'data', 'schema', 'exercises'])
  await mkdir(path.join(dist, dir), { recursive: true });
await copyFile(
  path.join(root, '.local/compiled/src/catalogue.js'),
  path.join(dist, 'assets/catalogue.js'),
);
await copyFile(
  path.join(root, '.local/compiled/src/taxonomy.js'),
  path.join(dist, 'assets/taxonomy.js'),
);
await copyFile(
  path.join(root, 'schema/taxonomy.schema.json'),
  path.join(dist, 'schema/taxonomy.schema.json'),
);
await writeFile(path.join(dist, 'data/taxonomy.json'), JSON.stringify(taxonomy, null, 2) + '\n');
for (const f of ['app.js', 'render.js', 'styles.css'])
  await copyFile(
    path.join(root, f.endsWith('.css') ? 'website' : '.local/compiled/website', f),
    path.join(dist, 'assets', f),
  );
await copyFile(
  path.join(root, 'schema/exercise.schema.json'),
  path.join(dist, 'schema/exercise.schema.json'),
);
// Serve the exact library artifacts; the site must not construct a second envelope.
for (const channel of ['preview', 'published'])
  await copyFile(
    path.join(root, `dist/package/catalogue.${channel}.json`),
    path.join(dist, `data/catalogue.${channel}.json`),
  );
await copyFile(
  path.join(root, 'dist/package/catalogue.schema.json'),
  path.join(dist, 'schema/catalogue.schema.json'),
);
await writeFile(
  path.join(dist, 'data/manifest.json'),
  JSON.stringify(
    {
      version,
      preview: { url: 'catalogue.preview.json', count: exercises.length },
      published: {
        url: 'catalogue.published.json',
        count: exercises.filter((e) => e.status === 'published').length,
      },
    },
    null,
    2,
  ) + '\n',
);
function page(body: string, entry: Exercise | null = null) {
  const title = entry ? `${entry.names.en} — Gravis` : 'Gravis Exercise Library';
  const description = entry
    ? entry.summary.en
    : 'An open library for strength, calisthenics and functional training. Explore the first bilingual editorial drafts.';
  const payload = JSON.stringify({
    exercises: entry ? [entry] : exercises,
    slug: entry?.slug || null,
    version,
  }).replaceAll('<', '\\u003c');
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${E(description)}"><meta name="theme-color" content="#1d3428"><meta name="robots" content="noindex,nofollow"><title>${E(title)}</title><link rel="stylesheet" href="/assets/styles.css"></head><body><div id="app">${body}</div><script id="page-data" type="application/json">${payload}</script><script type="module" src="/assets/app.js"></script></body></html>\n`;
}
await writeFile(
  path.join(dist, 'index.html'),
  page(
    cataloguePage(exercises, {
      lang: 'en',
      query: '',
      discipline: 'all',
      equipment: 'all',
      version,
    }),
  ),
);
for (const e of exercises) {
  const dir = path.join(dist, 'exercises', e.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), page(detailPage(e, 'en'), e));
}
await writeFile(
  path.join(dist, '404.html'),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found — Gravis</title><link rel="stylesheet" href="/assets/styles.css"><main class="wrap detail"><h1>Movement not found.</h1><p><a href="/">Return to the exercise library →</a></p></main></html>',
);
console.log(
  `Built ${exercises.length + 1} pages and separate preview/published datasets in dist/site/; importable library in dist/package/.`,
);
