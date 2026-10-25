import test, { type TestContext } from 'node:test';
import type { Exercise } from '../src/exercise.generated.js';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { exerciseFixture } from './fixtures/exercises.ts';
import { root, loadCatalogue } from '../scripts/lib.ts';
import {
  buildReviewPacket,
  writeReviewPacket,
  verifyReviewPacket,
  parseReviewArgs,
  loadReviewContext,
} from '../scripts/review-packet.ts';

function requiredFile(files: Map<string, string>, key: string): string {
  const value = files.get(key);
  assert(value !== undefined, `Missing packet file: ${key}`);
  return value;
}
const context = await loadReviewContext();
const entry = exerciseFixture();
const temporary = async (t: TestContext) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gravis-review-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
};

test('packets are deterministic, complete bilingual snapshots with separate pending forms', () => {
  const entries = [
    entry,
    { ...structuredClone(entry), id: 'grv_test00000099', slug: 'test-other-review' },
  ];
  const before = structuredClone(entries);
  const a = buildReviewPacket(
    entries,
    context,
    entries.map((e) => e.id),
  );
  const b = buildReviewPacket(entries, context, entries.map((e) => e.slug).reverse());
  assert.deepEqual(a, b);
  assert.deepEqual(entries, before);
  for (const e of entries) {
    const dir = `exercises/${e.slug}`;
    assert.deepEqual(JSON.parse(requiredFile(a.files, `${dir}/exercise.json`)), e);
    const text = requiredFile(a.files, `${dir}/snapshot.md`);
    assert(text.includes('## English') && text.includes('## Español'));
    assert(text.includes(e.tracking.notes.en) && text.includes(e.tracking.notes.es));
    assert(requiredFile(a.forms, `${dir}/review.md`).includes('Status: pending'));
    assert(!a.files.has(`${dir}/review.md`));
  }
  assert(a.files.has('context/taxonomy.json'));
  assert(a.files.has('context/schema/exercise.schema.json'));
  assert(a.files.has('context/docs/animation-pilot.md'));
});

test('selection and CLI reject ambiguous, unknown or malformed input before writing', () => {
  assert.throws(() => buildReviewPacket([entry], context, []), /Select/);
  assert.throws(() => buildReviewPacket([entry], context, ['missing']), /Unknown/);
  assert.throws(() => buildReviewPacket([entry], context, [entry.id, entry.slug]), /Duplicate/);
  const invalid = structuredClone(entry);
  // @ts-expect-error Deliberately invalid input exercises the runtime validation boundary.
  delete invalid.instructions.es;
  assert.throws(() => buildReviewPacket([invalid], context, [entry.id]), /es/);
  assert.throws(
    () => buildReviewPacket([entry], { ...context, files: { '../escape': 'bad' } }, [entry.id]),
    /context path/,
  );
  for (const args of [
    [],
    ['prepare'],
    ['prepare', '--output', 'x'],
    ['prepare', '--exercise', entry.id, '--output'],
    ['verify', '--packet', 'x', '--unexpected', 'value'],
    ['verify', '--packet', 'x', '--packet', 'y'],
  ])
    assert.throws(() => parseReviewArgs(args));
  assert.deepEqual(
    parseReviewArgs(['prepare', '--exercise', entry.id, '--output', 'local-packet']).selectors,
    [entry.id],
  );
});

test('new directories preserve existing packets and editable notes do not grant approval', async (t) => {
  const parent = await temporary(t);
  const destination = path.join(parent, 'packet');
  const packet = buildReviewPacket([entry], context, [entry.id]);
  await writeReviewPacket(destination, packet);
  const notes = path.join(destination, `exercises/${entry.slug}/review.md`);
  await writeFile(notes, 'Human notes: approved text, media still pending.');
  assert.equal(await verifyReviewPacket(destination, [entry], context), 1);
  await assert.rejects(writeReviewPacket(destination, packet), { code: 'EEXIST' });
  assert.equal(await readFile(notes, 'utf8'), 'Human notes: approved text, media still pending.');
  assert.equal(entry.review.technical, 'pending');
  assert.equal(entry.status, 'draft');
  const manifest = JSON.parse(await readFile(path.join(destination, 'manifest.json'), 'utf8'));
  assert(!('approved' in manifest));
});

test('verification rejects stale text, tracking, taxonomy and production guidance', async (t) => {
  const parent = await temporary(t);
  const destination = path.join(parent, 'packet');
  await writeReviewPacket(destination, buildReviewPacket([entry], context, [entry.id]));
  for (const change of [
    (e: Exercise) => {
      e.instructions.es[0] += ' Changed.';
    },
    (e: Exercise) => {
      e.tracking.notes.en += ' Changed.';
    },
  ]) {
    const changed = structuredClone(entry);
    change(changed);
    await assert.rejects(verifyReviewPacket(destination, [changed], context), /stale/);
  }
  for (const filename of ['taxonomy.json', 'docs/animation-pilot.md']) {
    const changed = structuredClone(context);
    changed.files[filename] += '\nChanged';
    await assert.rejects(verifyReviewPacket(destination, [entry], changed), /stale/);
  }
  await assert.rejects(
    verifyReviewPacket(destination, [entry], { ...context, version: '9.0.0' }),
    /stale/,
  );
});

test('verification rejects edited or missing snapshots and untrusted manifest paths', async (t) => {
  const parent = await temporary(t);
  const packet = buildReviewPacket([entry], context, [entry.id]);
  for (const filename of [
    'manifest.json',
    `exercises/${entry.slug}/exercise.json`,
    `exercises/${entry.slug}/snapshot.md`,
  ]) {
    const destination = path.join(parent, `packet-${path.basename(filename)}`);
    await writeReviewPacket(destination, packet);
    await writeFile(path.join(destination, filename), `${requiredFile(packet.files, filename)}\n`);
    await assert.rejects(verifyReviewPacket(destination, [entry], context), /stale/);
  }
  const destination = path.join(parent, 'missing');
  await writeReviewPacket(destination, packet);
  await rm(path.join(destination, `exercises/${entry.slug}/snapshot.md`));
  await assert.rejects(verifyReviewPacket(destination, [entry], context), { code: 'ENOENT' });
  const manifest = JSON.parse(requiredFile(packet.files, 'manifest.json'));
  manifest.exercises[0].id = '../outside';
  await writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest));
  await assert.rejects(verifyReviewPacket(destination, [entry], context), /Unknown exercise/);
});

test('record markup is rendered as text and internal packet links resolve offline', async (t) => {
  const parent = await temporary(t);
  const changed = structuredClone(entry);
  changed.names.en = '<script>alert(1)</script> [fake](https://example.com)';
  changed.instructions.es[0] = '# Encabezado `code` & <img src=x>';
  const packet = buildReviewPacket([changed], context, [changed.id]);
  const destination = path.join(parent, 'packet');
  await writeReviewPacket(destination, packet);
  const report = requiredFile(packet.files, `exercises/${changed.slug}/snapshot.md`);
  assert(!report.includes('<script>') && !report.includes('<img'));
  assert(report.includes('&#60;script&#62;'));
  assert.deepEqual(
    JSON.parse(requiredFile(packet.files, `exercises/${changed.slug}/exercise.json`)),
    changed,
  );
  for (const filename of ['README.md', `exercises/${changed.slug}/snapshot.md`]) {
    for (const match of requiredFile(packet.files, filename).matchAll(/\]\(([^)]+)\)/g))
      await access(path.resolve(destination, path.dirname(filename), match[1]));
  }
});

test('CLI prepares and verifies real selected records outside the repository cwd', async (t) => {
  const parent = await temporary(t);
  const run = promisify(execFile);
  const script = path.join(root, 'scripts/review-packet.ts');
  const entries = await loadCatalogue();
  const target = entries.find((e) => e.slug === 'ring-row');
  assert(target);
  const before = await readFile(path.join(root, 'exercises/ring-row.json'));
  const result = await run(
    process.execPath,
    [
      '--experimental-strip-types',
      script,
      'prepare',
      '--exercise',
      target.id,
      '--output',
      'packet',
    ],
    { cwd: parent },
  );
  assert.match(result.stdout, /Prepared 1 review forms/);
  const checked = await run(
    process.execPath,
    ['--experimental-strip-types', script, 'verify', '--packet', 'packet'],
    {
      cwd: parent,
    },
  );
  assert.match(checked.stdout, /Verified 1 snapshots/);
  await assert.rejects(
    run(
      process.execPath,
      ['--experimental-strip-types', script, 'prepare', '--exercise', 'unknown', '--output', 'bad'],
      {
        cwd: parent,
      },
    ),
  );
  await assert.rejects(access(path.join(parent, 'bad')), { code: 'ENOENT' });
  assert.deepEqual(await readFile(path.join(root, 'exercises/ring-row.json')), before);
});
