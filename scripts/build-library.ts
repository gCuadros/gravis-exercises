import type { Exercise } from '../src/index.js';
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { root } from './lib.ts';
import { catalogueSchema, createDistribution } from './catalogue-contract.ts';
import { taxonomy } from '../src/taxonomy.ts';

export async function buildLibrary(exercises: readonly Exercise[], version: string) {
  const distribution = createDistribution(exercises, version);
  const dir = path.join(root, 'dist/package');
  await mkdir(dir, { recursive: true });
  await copyFile(
    path.join(root, '.local/compiled/src/catalogue.js'),
    path.join(dir, 'catalogue.js'),
  );
  await copyFile(
    path.join(root, 'schema/exercise.schema.json'),
    path.join(dir, 'exercise.schema.json'),
  );
  for (const file of ['taxonomy.js', 'taxonomy.d.ts'])
    await copyFile(
      path.join(
        root,
        file.endsWith('.d.ts') ? 'src' : '.local/compiled/src',
        file === 'taxonomy.d.ts' ? 'taxonomy.types.ts' : file,
      ),
      path.join(dir, file),
    );
  await copyFile(
    path.join(root, 'schema/taxonomy.schema.json'),
    path.join(dir, 'taxonomy.schema.json'),
  );
  await writeFile(path.join(dir, 'taxonomy.json'), JSON.stringify(taxonomy, null, 2) + '\n');
  const types = await readFile(path.join(root, 'src/index.d.ts'), 'utf8');
  await writeFile(
    path.join(dir, 'catalogue.schema.json'),
    JSON.stringify(catalogueSchema, null, 2) + '\n',
  );
  for (const name of ['exercise', 'catalogue'])
    await copyFile(
      path.join(root, `src/${name}.generated.d.ts`),
      path.join(dir, `${name}.generated.d.ts`),
    );
  for (const [channel, data] of Object.entries(distribution)) {
    const name = channel === 'published' ? 'index' : 'preview';
    await writeFile(
      path.join(dir, `catalogue.${channel}.json`),
      JSON.stringify(data, null, 2) + '\n',
    );
    await writeFile(
      path.join(dir, `${name}.js`),
      `import { createCatalogue } from './catalogue.js';\nconst api = createCatalogue(${JSON.stringify(data)});\nexport const { catalogue, exercises, getExerciseById, getExerciseBySlug, findExercises } = api;\n`,
    );
    await writeFile(path.join(dir, `${name}.d.ts`), types);
  }
}
