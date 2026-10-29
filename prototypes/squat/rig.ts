import * as THREE from 'three';
import { motion, poseAt } from './motion.ts';
import type { Point } from './motion.ts';

/** Rigid articulated mannequin: editable named nodes, not a skinned anatomical character. */
export function createRig() {
  const root = new THREE.Group();
  root.name = 'Gravis_draft_squat_v1';
  root.userData = {
    exerciseId: 'grv_000000000009',
    status: 'unreviewed-prototype',
    creator: 'AI-assisted procedural source authored for Gravis',
    source: 'prototypes/squat',
    version: 1,
    units: 'metres',
    technicalApproval: false,
    rightsReview: 'pending',
  };
  const dark = new THREE.MeshStandardMaterial({ color: '#303f48', roughness: 0.84 });
  const teal = new THREE.MeshStandardMaterial({ color: '#15998d', roughness: 0.8 });
  const skin = new THREE.MeshStandardMaterial({ color: '#c4aa8f', roughness: 0.9 });
  const joint = new THREE.MeshStandardMaterial({ color: '#60747a', roughness: 0.9 });
  const nodes: THREE.Group[] = [];
  function node(name: string, parent: THREE.Object3D = root) {
    const n = new THREE.Group();
    n.name = name;
    parent.add(n);
    nodes.push(n);
    return n;
  }
  function ellipsoid(
    parent: THREE.Object3D,
    scale: Point,
    position: Point,
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), material);
    mesh.scale.set(...scale);
    mesh.position.set(...position);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function segment(
    name: string,
    length: number,
    radius: number,
    parent: THREE.Object3D,
    material = dark,
  ) {
    const n = node(name, parent);
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, Math.max(0.01, length - 2 * radius), 8, 16),
      material,
    );
    mesh.position.y = length / 2;
    mesh.castShadow = true;
    n.add(mesh);
    ellipsoid(n, [radius * 0.85, radius * 0.85, radius * 0.85], [0, 0, 0], joint);
    return n;
  }
  const pelvis = node('pelvis');
  ellipsoid(pelvis, [0.19, 0.115, 0.115], [0, 0.035, 0], dark);
  const torso = node('torso', pelvis);
  const shape = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.13, 0.04),
      new THREE.Vector2(0.145, 0.18),
      new THREE.Vector2(0.205, 0.36),
      new THREE.Vector2(0.17, 0.44),
      new THREE.Vector2(0.07, 0.46),
    ],
    32,
  );
  const shirt = new THREE.Mesh(shape, dark);
  shirt.scale.z = 0.65;
  shirt.castShadow = true;
  torso.add(shirt);
  ellipsoid(torso, [0.135, 0.024, 0.095], [0, 0.07, 0], teal);
  const neck = segment('neck', 0.075, 0.045, torso, skin);
  const head = node('head', neck);
  ellipsoid(head, [0.09, 0.12, 0.095], [0, 0, 0], skin);
  ellipsoid(head, [0.024, 0.028, 0.022], [0, -0.005, 0.093], skin);
  const sides = (['left', 'right'] as const).map((side) => {
    const thigh = segment(side + '_thigh', motion.thigh, 0.079, pelvis);
    const shin = segment(side + '_shin', motion.shin, 0.055, thigh);
    const foot = node(side + '_foot', shin);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.09, 0.28), dark);
    shoe.position.set(0, -0.03, 0.06);
    shoe.castShadow = true;
    foot.add(shoe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.128, 0.015, 0.284), teal);
    sole.position.set(0, -0.0675, 0.06);
    foot.add(sole);
    const upperArm = segment(side + '_upperArm', motion.upperArm, 0.049, torso, skin);
    const forearm = segment(side + '_forearm', motion.forearm, 0.038, upperArm, skin);
    const hand = node(side + '_hand', forearm);
    ellipsoid(hand, [0.035, 0.06, 0.023], [0, 0.03, 0], skin);
    return { side, thigh, shin, foot, upperArm, forearm, hand };
  });
  function place(n: THREE.Group, start: Point, end?: Point, rotation = new THREE.Quaternion()) {
    const parent = n.parent!;
    parent.updateWorldMatrix(true, false);
    n.position.copy(parent.worldToLocal(new THREE.Vector3(...start)));
    const q = end
      ? new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(...end).sub(new THREE.Vector3(...start)).normalize(),
        )
      : rotation;
    n.quaternion.copy(parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
    n.updateMatrixWorld(true);
  }
  function update(time: number, loop = false) {
    const p = poseAt(time, loop);
    place(pelvis, p.pelvis);
    place(torso, p.pelvis, p.chest);
    place(neck, p.chest, p.neck);
    place(head, p.head);
    for (const s of sides) {
      const l = p[s.side];
      place(s.thigh, l.hip, l.knee);
      place(s.shin, l.knee, l.ankle);
      place(
        s.foot,
        l.ankle,
        undefined,
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          s.side === 'left' ? -motion.toeOut : motion.toeOut,
        ),
      );
      place(s.upperArm, l.shoulder, l.elbow);
      place(s.forearm, l.elbow, l.wrist);
      place(s.hand, l.wrist, undefined, s.forearm.getWorldQuaternion(new THREE.Quaternion()));
    }
    return p;
  }
  function clip(loop = false) {
    const duration = loop ? motion.cycle : motion.duration;
    const times: number[] = [];
    const values = nodes.map(() => ({ positions: [] as number[], rotations: [] as number[] }));
    for (let frame = 0; frame <= duration * motion.fps; frame++) {
      times.push(frame / motion.fps);
      update(frame / motion.fps, loop);
      nodes.forEach((n, i) => {
        values[i].positions.push(...n.position.toArray());
        values[i].rotations.push(...n.quaternion.toArray());
      });
    }
    update(0);
    return new THREE.AnimationClip(
      loop ? 'squat_loop_draft' : 'squat_full_draft',
      duration,
      nodes.flatMap((n, i) => [
        new THREE.VectorKeyframeTrack(n.name + '.position', times, values[i].positions),
        new THREE.QuaternionKeyframeTrack(n.name + '.quaternion', times, values[i].rotations),
      ]),
    );
  }
  update(0);
  return { root, nodes, update, clip };
}
