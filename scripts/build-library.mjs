import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { compile } from 'json-schema-to-typescript';
import { root, schema } from './lib.mjs';

export async function buildLibrary(exercises, version) {
  const dir = path.join(root, 'dist/package');
  await mkdir(dir, { recursive: true });
  await copyFile(path.join(root, 'src/catalogue.js'), path.join(dir, 'catalogue.js'));
  await copyFile(
    path.join(root, 'schema/exercise.schema.json'),
    path.join(dir, 'exercise.schema.json'),
  );
  const types = await readFile(path.join(root, 'src/index.d.ts'), 'utf8');
  const generated = await compile(schema, 'Exercise', {
    bannerComment: '/* Generated from schema/exercise.schema.json. Do not edit. */',
    additionalProperties: false,
  });
  await writeFile(path.join(dir, 'exercise.generated.d.ts'), generated);
  for (const channel of ['published', 'preview']) {
    const entries =
      channel === 'published'
        ? exercises.filter((exercise) => exercise.status === 'published')
        : exercises;
    const data = { schemaVersion: 1, version, channel, license: 'MIT', exercises: entries };
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
