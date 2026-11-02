import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { verifyArchive } from '../scripts/character-integrity.ts';
test('character source verification rejects changed and missing downloads', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gravis-character-'));
  const file = path.join(dir, 'source');
  const expected = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
  try {
    await writeFile(file, 'abc');
    await verifyArchive(file, expected);
    await writeFile(file, 'abd');
    await assert.rejects(verifyArchive(file, expected), /checksum mismatch/);
    await assert.rejects(verifyArchive(path.join(dir, 'missing'), expected), /ENOENT/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
