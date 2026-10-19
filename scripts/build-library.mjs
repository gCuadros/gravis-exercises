import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { compile } from 'json-schema-to-typescript';
import { root, schema } from './lib.mjs';
import { catalogueSchema, createDistribution } from './catalogue-contract.mjs';
import { taxonomy } from '../src/taxonomy.js';

export async function buildLibrary(exercises, version) {
  const distribution = createDistribution(exercises, version);
  const dir = path.join(root, 'dist/package');
  await mkdir(dir, { recursive: true });
  await copyFile(path.join(root, 'src/catalogue.js'), path.join(dir, 'catalogue.js'));
  await copyFile(
    path.join(root, 'schema/exercise.schema.json'),
    path.join(dir, 'exercise.schema.json'),
  );
  for (const file of ['taxonomy.js', 'taxonomy.d.ts'])
    await copyFile(path.join(root, 'src', file), path.join(dir, file));
  await copyFile(
    path.join(root, 'schema/taxonomy.schema.json'),
    path.join(dir, 'taxonomy.schema.json'),
  );
  await writeFile(path.join(dir, 'taxonomy.json'), JSON.stringify(taxonomy, null, 2) + '\n');
  const types = await readFile(path.join(root, 'src/index.d.ts'), 'utf8');
  const generated = await compile(schema, 'Exercise', {
    bannerComment: '/* Generated from schema/exercise.schema.json. Do not edit. */',
    additionalProperties: false,
  });
  await writeFile(path.join(dir, 'exercise.generated.d.ts'), generated);
  await writeFile(
    path.join(dir, 'catalogue.schema.json'),
    JSON.stringify(catalogueSchema, null, 2) + '\n',
  );
  await writeFile(
    path.join(dir, 'catalogue.generated.d.ts'),
    await compile(catalogueSchema, 'Catalogue', {
      bannerComment: '/* Generated from the bundled catalogue schema. Do not edit. */',
      additionalProperties: false,
    }),
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
