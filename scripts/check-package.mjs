import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { root, loadCatalogue } from './lib.mjs';

const exec = promisify(execFile);
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
assert(!manifest.dependencies, 'The consumer package must have no runtime dependencies');
const destination = path.join(root, 'artifacts');
await mkdir(destination, { recursive: true });
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, npm_config_cache: path.join(root, '.local/npm-cache') };
const pack = async () =>
  JSON.parse(
    (
      await exec(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', destination], {
        cwd: root,
        env,
      })
    ).stdout,
  )[0];
const first = await pack();
const second = await pack();
assert.equal(first.integrity, second.integrity, 'Repeated packing must produce identical bytes');
const expected = [
  'package.json',
  'README.md',
  'LICENSE',
  ...[
    'index.js',
    'index.d.ts',
    'preview.js',
    'preview.d.ts',
    'catalogue.js',
    'exercise.generated.d.ts',
    'exercise.schema.json',
    'catalogue.preview.json',
    'catalogue.published.json',
  ].map((file) => `dist/package/${file}`),
];
assert.deepEqual(
  first.files.map((file) => file.path).sort(),
  expected.sort(),
  'Only the public library belongs in the archive',
);
const archive = path.join(destination, first.filename);
const digest = createHash('sha256')
  .update(await readFile(archive))
  .digest('hex');
await writeFile(
  path.join(destination, `${first.filename}.sha256`),
  `${digest}  ${first.filename}\n`,
);
const consumer = await mkdtemp(path.join(os.tmpdir(), 'gravis-consumer-'));
try {
  await writeFile(
    path.join(consumer, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  await exec(
    npm,
    ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', archive],
    { cwd: consumer, env },
  );
  const source = await loadCatalogue();
  const fixture = source[0];
  await writeFile(
    path.join(consumer, 'check.mjs'),
    `
    import assert from 'node:assert/strict';
    import * as published from 'gravis-exercises';
    import * as preview from 'gravis-exercises/preview';
    import data from 'gravis-exercises/data' with { type: 'json' };
    import schema from 'gravis-exercises/schema' with { type: 'json' };
    assert.equal(preview.exercises.length, ${source.length});
    assert.equal(published.exercises.length, ${source.filter((exercise) => exercise.status === 'published').length});
    assert(published.exercises.every(exercise => exercise.status === 'published'));
    assert.equal(published.catalogue.channel, 'published');
    assert.equal(preview.catalogue.channel, 'preview');
    assert.deepEqual(data.exercises, published.exercises);
    assert.equal(schema.title, 'Exercise');
    assert.equal(preview.getExerciseById(${JSON.stringify(fixture.id)}).slug, ${JSON.stringify(fixture.slug)});
    assert.equal(preview.getExerciseBySlug(${JSON.stringify(fixture.slug)}).id, ${JSON.stringify(fixture.id)});
    assert.equal(preview.getExerciseById('missing'), undefined);
    assert(preview.findExercises({query: ${JSON.stringify(fixture.names.en)}}).length > 0);
    assert(Object.isFrozen(preview.exercises[0].names));
    assert.throws(() => { preview.exercises[0].names.en = 'changed'; }, TypeError);
  `,
  );
  await exec(process.execPath, ['check.mjs'], { cwd: consumer });
  // Type-check against the installed archive, not workspace self-resolution.
  await writeFile(
    path.join(consumer, 'check.ts'),
    await readFile(path.join(root, 'tests/types/consumer.ts'), 'utf8'),
  );
  await writeFile(
    path.join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        noEmit: true,
        types: [],
      },
      include: ['check.ts'],
    }),
  );
  await exec(
    process.execPath,
    [
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '--project',
      path.join(consumer, 'tsconfig.json'),
    ],
    { cwd: consumer },
  );
  console.log(
    `Package verified in an isolated consumer: ${first.filename}; ESM, JSON, types, immutability, channel isolation and archive contents passed.`,
  );
} finally {
  await rm(consumer, { recursive: true, force: true });
}
