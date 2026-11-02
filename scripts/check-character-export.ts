import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root } from './lib.ts';
import { fileHash } from './character-integrity.ts';
const input = process.argv[2];
if (!input) throw new Error('Pass a generated character-base.glb path.');
const model = path.resolve(root, input);
const output = path.join(path.dirname(model), 'browser-validation.json');
const files: Record<string, string> = {
  '/character.glb': model,
  '/three.js': path.join(root, 'node_modules/three/build/three.module.js'),
  '/three.core.js': path.join(root, 'node_modules/three/build/three.core.js'),
};
for (const file of [
  'loaders/GLTFLoader.js',
  'utils/BufferGeometryUtils.js',
  'utils/SkeletonUtils.js',
])
  files['/addons/' + file] = path.join(root, 'node_modules/three/examples/jsm', file);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('http://gravis-character.test/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/')
      return route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><script type="importmap">{"imports":{"three":"/three.js"}}</script>',
      });
    const file = files[pathname];
    if (!file) return route.abort();
    return route.fulfill({
      contentType: pathname.endsWith('.js') ? 'text/javascript' : 'model/gltf-binary',
      body: await readFile(file),
    });
  });
  await page.goto('http://gravis-character.test/');
  const result = await page.evaluate(async () => {
    const threeURL = '/three.js';
    const loaderURL = '/addons/loaders/GLTFLoader.js';
    const THREE: typeof import('three') = await import(threeURL);
    const module: typeof import('three/addons/loaders/GLTFLoader.js') = await import(loaderURL);
    const gltf = await new module.GLTFLoader().loadAsync('/character.glb');
    const skins: import('three').SkinnedMesh[] = [];
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.SkinnedMesh) skins.push(obj);
    });
    if (!skins.length || !gltf.animations.length) throw new Error('Missing skin or animation');
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[0]);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    const heights: number[] = [];
    for (const time of [0, 2.7, 5, 6.7, 10]) {
      mixer.setTime(time);
      gltf.scene.updateMatrixWorld(true);
      skins.forEach((s) => {
        s.skeleton.update();
        s.computeBoundingBox();
      });
      const bounds = new THREE.Box3().setFromObject(gltf.scene, true);
      const size = bounds.getSize(new THREE.Vector3());
      if (![...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite))
        throw new Error('Non-finite animated bounds');
      heights.push(size.y);
    }
    return {
      skinMeshes: skins.length,
      animations: gltf.animations.map((a) => ({ name: a.name, duration: a.duration })),
      heightsAtSeconds: [0, 2.7, 5, 6.7, 10].map((time, i) => ({ time, height: heights[i] })),
    };
  });
  assert.deepEqual(errors, []);
  const heights = result.heightsAtSeconds.map((s) => s.height);
  assert.ok(heights[0] - heights[1] > 0.2, 'Export must preserve a visible squat descent');
  assert.ok(Math.abs(heights[0] - heights[4]) < 0.01, 'Full take must return to standing');
  assert.ok(
    result.animations.some((a) => Math.abs(a.duration - 10) < 0.04),
    'Full take must preserve ten-second timing',
  );
  await writeFile(
    output,
    JSON.stringify(
      {
        file: path.basename(model),
        sha256: await fileHash(model),
        ...result,
        limits: 'Load and animation checks only; no visual, anatomy or technique approval',
      },
      null,
      2,
    ) + '\n',
    { flag: 'wx' },
  );
  console.log(`Verified skinned GLB in Chromium: ${output}`);
} finally {
  await browser.close();
}
