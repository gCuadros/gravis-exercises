import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { root } from './lib.ts';
const destination = path.join(root, '.local/media-preview');
await mkdir(path.join(destination, 'vendor/addons/exporters'), { recursive: true });
for (const file of ['index.html', 'style.css'])
  await copyFile(path.join(root, 'prototypes/squat', file), path.join(destination, file));
for (const file of ['three.module.js', 'three.core.js'])
  await copyFile(
    path.join(root, 'node_modules/three/build', file),
    path.join(destination, 'vendor', file),
  );
await copyFile(
  path.join(root, 'node_modules/three/examples/jsm/exporters/GLTFExporter.js'),
  path.join(destination, 'vendor/addons/exporters/GLTFExporter.js'),
);
await copyFile(
  path.join(root, 'node_modules/three/LICENSE'),
  path.join(destination, 'vendor/LICENSE-three.txt'),
);
console.log('Draft studio built in .local/media-preview; excluded from library/site.');
