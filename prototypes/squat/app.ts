import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createRig } from './rig.ts';
import { motion } from './motion.ts';
function element<T extends HTMLElement>(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error('Missing ' + id);
  return el as T;
}
const canvas = document.querySelector('canvas')!;
const play = element<HTMLButtonElement>('play');
const timeline = element<HTMLInputElement>('timeline');
const mode = element<HTMLSelectElement>('mode');
const view = element<HTMLSelectElement>('view');
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
} catch (error) {
  const message = element('error');
  message.hidden = false;
  message.textContent = 'No se ha podido iniciar el visor 3D. Necesita WebGL 2.';
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#edf0e9');
const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 30);
scene.add(new THREE.HemisphereLight('#ffffff', '#8a9e8c', 2.5));
const light = new THREE.DirectionalLight('#ffffff', 3);
light.position.set(2, 5, 3);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
light.shadow.camera.left = -2;
light.shadow.camera.right = 2;
light.shadow.camera.top = 2;
light.shadow.camera.bottom = -2;
light.shadow.normalBias = 0.02;
light.shadow.radius = 4;
scene.add(light);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ opacity: 0.16 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const rig = createRig();
scene.add(rig.root);
let frame = 0,
  playing = false,
  previousTime = 0,
  carry = 0;
const isLoop = () => mode.value === 'loop';
const lastFrame = () => (isLoop() ? motion.cycle : motion.duration) * motion.fps;
function pause() {
  playing = false;
  play.textContent = 'Reproducir';
  carry = 0;
}
function render() {
  rig.update(frame / motion.fps, isLoop());
  const size = canvas.parentElement!.clientWidth;
  renderer.setSize(size, size, false);
  const angles: Record<string, [number, number, number]> = {
    three: [2.6, 1.9, 3.6],
    side: [4.5, 1.35, 0],
    front: [0, 1.5, 4.5],
  };
  camera.position.set(...angles[view.value]);
  camera.lookAt(0, 0.88, 0);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  timeline.value = String(frame);
  element('time').textContent =
    (frame / motion.fps).toFixed(2).padStart(5, '0') + ' s · F' + String(frame).padStart(3, '0');
  element('phase').textContent = isLoop()
    ? 'Bucle · 1 repetición'
    : frame < 30
      ? 'Preparación'
      : frame >= 270
        ? 'Final'
        : frame < 150
          ? 'Repetición 1 / 2'
          : 'Repetición 2 / 2';
}
play.addEventListener('click', () => {
  if (playing) pause();
  else {
    if (frame === lastFrame()) frame = 0;
    playing = true;
    previousTime = performance.now();
    play.textContent = 'Pausar';
  }
});
timeline.addEventListener('input', () => {
  pause();
  frame = Number(timeline.value);
  render();
});
for (const [id, delta] of [
  ['previous', -1],
  ['next', 1],
] as const)
  element(id).addEventListener('click', () => {
    pause();
    frame = Math.max(0, Math.min(lastFrame(), frame + delta));
    render();
  });
view.addEventListener('change', render);
mode.addEventListener('change', () => {
  pause();
  frame = 0;
  timeline.max = String(lastFrame());
  render();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
});
new ResizeObserver(render).observe(canvas.parentElement!);
function tick(now: number) {
  if (playing) {
    carry += ((now - previousTime) * motion.fps) / 1000;
    const advance = Math.floor(carry);
    carry -= advance;
    frame += advance;
    if (frame >= lastFrame()) {
      if (isLoop()) frame %= lastFrame();
      else {
        frame = lastFrame();
        pause();
      }
    }
    render();
  }
  previousTime = now;
  requestAnimationFrame(tick);
}
const exportButton = element<HTMLButtonElement>('export');
exportButton.addEventListener('click', async () => {
  pause();
  exportButton.disabled = true;
  const status = element('export-status');
  status.textContent = 'Preparando escena…';
  try {
    const clips = [rig.clip(false), rig.clip(true)];
    const result = await new GLTFExporter().parseAsync(rig.root, {
      binary: true,
      animations: clips,
    });
    if (!(result instanceof ArrayBuffer)) throw new Error('Unexpected export');
    const blob = new Blob([result], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gravis-squat-draft-v1.glb';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Descargada · borrador sin aprobación.';
  } catch {
    status.textContent = 'No se ha podido exportar. Revisa la consola y vuelve a intentarlo.';
  } finally {
    exportButton.disabled = false;
    render();
  }
});
render();
canvas.dataset.ready = 'true';
requestAnimationFrame(tick);
