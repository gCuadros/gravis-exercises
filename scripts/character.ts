import { mkdir, readFile, writeFile, rename, rm, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import sources from '../prototypes/character/sources.json' with { type: 'json' };
import { poseAt, motion } from '../prototypes/squat/motion.ts';
import { root } from './lib.ts';
import { fileHash, verifyArchive } from './character-integrity.ts';

const cache = path.join(root, '.local/character-cache');
function run(command: string, args: string[], env = process.env): string {
  const result = spawnSync(command, args, { env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0)
    throw new Error(`${command} failed: ${result.error?.message ?? result.stderr + result.stdout}`);
  return result.stdout;
}
const operation = process.argv[2];
if (operation === 'prepare') {
  await mkdir(cache, { recursive: true });
  for (const entry of sources.archives) {
    const destination = path.join(cache, entry.file);
    if (!(await stat(destination).catch(() => null))) {
      console.log(`Downloading pinned source: ${entry.file}`);
      const response = await fetch(entry.url);
      if (!response.ok || !response.body)
        throw new Error(`Download failed: ${entry.url} (${response.status})`);
      const temporary = destination + '.partial-' + randomUUID();
      const reader = response.body.getReader();
      async function* chunks() {
        try {
          while (true) {
            const part = await reader.read();
            if (part.done) return;
            yield part.value;
          }
        } finally {
          reader.releaseLock();
        }
      }
      try {
        await pipeline(Readable.from(chunks()), createWriteStream(temporary, { flags: 'wx' }));
        await verifyArchive(temporary, entry.sha256);
        await rename(temporary, destination);
      } catch (error) {
        await rm(temporary, { force: true });
        throw error;
      }
    }
    await verifyArchive(destination, entry.sha256);
    console.log(`Verified ${entry.file}`);
  }
} else if (operation === 'build') {
  const blender = process.env.BLENDER_BIN;
  if (!blender || !path.isAbsolute(blender))
    throw new Error('Set BLENDER_BIN to an absolute Blender executable path.');
  if (!run(blender, ['--version']).startsWith(`Blender ${sources.blender} `))
    throw new Error(`Expected Blender ${sources.blender}.`);
  const destination = process.argv.slice(3).filter((value) => value !== '--')[0];
  if (!destination)
    throw new Error('Usage: pnpm run character:build -- .local/character-builds/<new-version>');
  const output = path.resolve(root, destination);
  if (!output.startsWith(path.join(root, '.local') + path.sep))
    throw new Error('Character outputs must stay in the ignored .local directory.');
  for (const entry of sources.archives)
    await verifyArchive(path.join(cache, entry.file), entry.sha256);
  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(output); // Deliberately refuse existing output directories.
  const inputs = path.join(output, 'inputs');
  await mkdir(path.join(inputs, 'assets'), { recursive: true });
  for (const entry of sources.archives) {
    const archive = path.join(cache, entry.file);
    if (entry.kind === 'source') run('tar', ['-xzf', archive, '-C', inputs]);
    else run('unzip', ['-qo', archive, '-d', path.join(inputs, 'assets')]);
  }
  const recipe = path.join(root, 'prototypes/character/blender_recipe.py');
  const recipeSnapshot = path.join(output, 'blender_recipe.py');
  await writeFile(recipeSnapshot, await readFile(recipe));
  const config = {
    inputs,
    output,
    fps: motion.fps,
    depths: Array.from({ length: 301 }, (_, f) => poseAt(f / motion.fps).depth),
  };
  const configPath = path.join(output, 'build-config.json');
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  const environment = { ...process.env, BLENDER_USER_RESOURCES: path.join(output, 'blender-user') };
  console.log('Building and rendering the unreviewed character; this may take several minutes.');
  let log: string;
  try {
    log = run(
      blender,
      [
        '--background',
        '--factory-startup',
        '--offline-mode',
        '--python-exit-code',
        '1',
        '--python',
        recipeSnapshot,
        '--',
        configPath,
      ],
      environment,
    );
  } catch (error) {
    await writeFile(path.join(output, 'blender.log'), String(error));
    throw new Error(`Native build failed; see ${path.join(output, 'blender.log')}`, {
      cause: error,
    });
  }
  await writeFile(path.join(output, 'blender.log'), log);
  const filenames = [
    'gravis-athlete-v2.blend',
    'character-base.glb',
    'standing.png',
    'squat-front.png',
    'squat-rear.png',
    'native-validation.json',
  ];
  const assets = await Promise.all(
    filenames.map(async (file) => ({
      file,
      bytes: (await stat(path.join(output, file))).size,
      sha256: await fileHash(path.join(output, file)),
    })),
  );
  const manifest = {
    schemaVersion: 1,
    status: 'unreviewed-development-sample',
    visualTargetMet: false,
    technicalApproval: false,
    renderer: `Blender ${sources.blender}`,
    sources,
    recipeSha256: await fileHash(recipeSnapshot),
    motionSha256: await fileHash(path.join(root, 'prototypes/squat/motion.ts')),
    assets,
  };
  await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Character evidence: ${output}`);
  console.log(await readFile(path.join(output, 'native-validation.json'), 'utf8'));
} else {
  throw new Error('Expected prepare or build.');
}
