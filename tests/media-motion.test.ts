import assert from 'node:assert/strict';
import { test } from 'node:test';
import { motion, poseAt } from '../prototypes/squat/motion.ts';
import type { Point } from '../prototypes/squat/motion.ts';
import { createRig } from '../prototypes/squat/rig.ts';
import { Vector3, AnimationMixer, LoopOnce } from 'three';
const distance = (a: Point, b: Point) => Math.hypot(...a.map((n, i) => n - b[i]));
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-7, `${a} differs from ${b}`);
test('all sampled poses preserve limb lengths and fixed ankle contacts', () => {
  for (let frame = 0; frame <= 300; frame++) {
    const p = poseAt(frame / 30);
    for (const side of ['left', 'right'] as const) {
      const l = p[side];
      close(distance(l.ankle, l.knee), motion.shin);
      close(distance(l.knee, l.hip), motion.thigh);
      close(distance(l.shoulder, l.elbow), motion.upperArm);
      close(distance(l.elbow, l.wrist), motion.forearm);
      assert.deepEqual(l.ankle, poseAt(0)[side].ankle);
    }
    close(distance(p.pelvis, p.chest), motion.torso);
  }
});
test('full sequence has two parallel-thigh endpoints and returns to ready pose', () => {
  assert.deepEqual(poseAt(0), poseAt(10));
  for (const time of [2.7, 6.7]) {
    const p = poseAt(time);
    close(p.left.hip[1], p.left.knee[1]);
    close(p.depth, 1);
  }
  for (const time of [0, 1, 5, 9, 10]) close(poseAt(time).depth, 0);
  assert.throws(() => poseAt(NaN), /finite/);
});
test('loop seam has equal poses and near-zero velocities, without deleting the endpoint', () => {
  assert.deepEqual(poseAt(0, true), poseAt(4, true));
  close(poseAt(0.0001, true).pelvis[1], poseAt(3.9999, true).pelvis[1]);
  close(poseAt(1.7, true).depth, 1);
});
test('rig hierarchy follows geometric contacts and exported clips can be replayed', () => {
  const rig = createRig();
  for (const time of [0, 2.7, 5, 6.7, 10]) {
    const p = rig.update(time);
    for (const side of ['left', 'right'] as const) {
      const foot = rig.root.getObjectByName(side + '_foot')!;
      const position = foot.getWorldPosition(new Vector3());
      position.toArray().forEach((n, i) => close(n, p[side].ankle[i]));
    }
  }
  const clip = rig.clip();
  assert.equal(clip.duration, 10);
  assert.equal(rig.clip(true).duration, 4);
  const mixer = new AnimationMixer(rig.root);
  const action = mixer.clipAction(clip);
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  mixer.setTime(2.7);
  rig.root.updateMatrixWorld(true);
  const foot = rig.root.getObjectByName('left_foot')!.getWorldPosition(new Vector3());
  foot.toArray().forEach((n, i) => close(n, poseAt(2.7).left.ankle[i]));
});
