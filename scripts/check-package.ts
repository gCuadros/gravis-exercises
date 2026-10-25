import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { Ajv2020, addFormats } from './ajv.ts';
import { createRequire } from 'node:module';
import { exerciseFixture } from '../tests/fixtures/exercises.ts';
import { createHash } from 'node:crypto';
import { root, loadCatalogue } from './lib.ts';

import type { Catalogue } from '../src/catalogue.generated.js';
import type { Schema } from 'ajv';
interface PackResult {
  filename: string;
  files: { path: string }[];
}
const exec = promisify(execFile);
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
assert(!manifest.dependencies, 'The consumer package must have no runtime dependencies');
const destination = path.join(root, 'artifacts');
await mkdir(destination, { recursive: true });
// Reuse the exact invoking pnpm; a global shim may select a different version outside this repository.
const pnpm = process.env.npm_execpath;
assert(
  pnpm &&
    process.env.npm_config_user_agent?.startsWith(`${manifest.packageManager.replace('@', '/')} `),
  'Run this check through the pinned pnpm version.',
);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, npm_config_cache: path.join(root, '.local/npm-cache') };
const pack = async () => {
  const result: PackResult = JSON.parse(
    (
      await exec(pnpm, ['pack', '--ignore-scripts', '--json', '--pack-destination', destination], {
        cwd: root,
        env,
      })
    ).stdout,
  );
  const filename = path.basename(result.filename);
  assert.equal(filename, `${manifest.name}-${manifest.version}.tgz`);
  // Hash bytes from each pack immediately; pnpm's JSON does not supply integrity.
  const integrity = createHash('sha512')
    .update(await readFile(path.join(destination, filename)))
    .digest('hex');
  return { ...result, filename, integrity };
};
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
    'taxonomy.js',
    'taxonomy.d.ts',
    'taxonomy.json',
    'taxonomy.schema.json',
    'exercise.generated.d.ts',
    'catalogue.generated.d.ts',
    'catalogue.schema.json',
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
for (const manager of ['pnpm', 'npm'] as const) {
  const consumer = await mkdtemp(path.join(os.tmpdir(), `gravis-consumer-${manager}-`));
  try {
    await writeFile(
      path.join(consumer, 'package.json'),
      JSON.stringify({
        private: true,
        type: 'module',
      }),
    );
    await exec(
      manager === 'pnpm' ? pnpm : npm,
      manager === 'pnpm'
        ? [
            'add',
            '--offline',
            '--ignore-scripts',
            '--config.managePackageManagerVersions=false',
            '--store-dir',
            path.join(consumer, '.store'),
            `--config.cacheDir=${path.join(consumer, '.cache')}`,
            archive,
          ]
        : ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', archive],
      { cwd: consumer, env: { ...env, npm_config_cache: path.join(consumer, '.npm-cache') } },
    );
    // Validate files extracted from the installed archive, with no source-schema
    // registration or remote resolver. The validator is a development tool only.
    const installed = createRequire(path.join(consumer, 'check.cjs'));
    const readExport = async (name: string): Promise<unknown> =>
      JSON.parse(await readFile(installed.resolve(name), 'utf8'));
    const installedSchema = await readExport('gravis-exercises/schema/catalogue');
    const validator = new Ajv2020({ strict: true, allErrors: true });
    addFormats(validator);
    const validate = validator.compile<Catalogue>(installedSchema as Schema);
    for (const [channel, name] of [
      ['published', 'gravis-exercises/data'],
      ['preview', 'gravis-exercises/data/preview'],
    ]) {
      const data = await readExport(name);
      assert(validate(data), JSON.stringify(validate.errors));
      assert.equal(data.version, manifest.version);
      assert.equal(data.channel, channel);
      const site = await readFile(
        path.join(root, `dist/site/data/catalogue.${channel}.json`),
        'utf8',
      );
      assert.equal(
        site,
        await readFile(installed.resolve(name), 'utf8'),
        'Site and package feeds must be byte-identical',
      );
    }
    assert.deepEqual(
      installedSchema,
      JSON.parse(await readFile(path.join(root, 'dist/site/schema/catalogue.schema.json'), 'utf8')),
    );
    const original = await readExport('gravis-exercises/data');
    assert(validate(original));
    const tampered: Omit<Catalogue, 'license'> & { license: string } = { ...original };
    tampered.exercises = [exerciseFixture()];
    assert.equal(
      validate(tampered),
      false,
      'The archived schema must reject a draft injected into published data',
    );
    tampered.exercises = [];
    tampered.license = 'unknown';
    assert.equal(
      validate(tampered),
      false,
      'The archived schema must reject invalid envelope metadata',
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
    import catalogueSchema from 'gravis-exercises/schema/catalogue' with { type: 'json' };
    assert.equal(catalogueSchema.title, 'Catalogue');
    import { taxonomy, getTerm, getLabel } from 'gravis-exercises/taxonomy';
    import vocabulary from 'gravis-exercises/taxonomy/data' with { type: 'json' };
    import vocabularySchema from 'gravis-exercises/taxonomy/schema' with { type: 'json' };
    assert.deepEqual(taxonomy, vocabulary);
    assert.equal(vocabularySchema.properties.schemaVersion.const, taxonomy.schemaVersion);
    assert.equal(getLabel('metrics', 'assistance', 'es'), 'Asistencia');
    assert.equal(getLabel('equipment', 'band', 'es'), 'Banda elástica');
    assert.equal(getTerm('equipment', 'missing'), undefined);
    assert.equal(getTerm('equipment', '__proto__'), undefined);
    assert.throws(() => { taxonomy.groups.equipment.band.aliases.es.push('changed'); }, TypeError);
    assert.equal(preview.catalogue.schemaVersion, schema.properties.schemaVersion.const);
    for (const exercise of preview.exercises) {
      assert(getTerm('families', exercise.family));
      assert(exercise.equipment.every(key => getTerm('equipment', key)));
    }
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
      `Package verified in an isolated ${manager} consumer: ${first.filename}; ESM, JSON, types, immutability, channel isolation and archive contents passed.`,
    );
  } finally {
    await rm(consumer, { recursive: true, force: true });
  }
}
