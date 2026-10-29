/** Original geometric blocking, metres / seconds; not a validated coaching model. */
export type Point = readonly [number, number, number];
export const motion = Object.freeze({
  fps: 30,
  cycle: 4,
  setup: 1,
  duration: 10,
  shin: 0.43,
  thigh: 0.43,
  torso: 0.46,
  upperArm: 0.28,
  forearm: 0.25,
  ankleHeight: 0.075,
  stance: 0.34,
  toeOut: 0.12,
});
export type Side = 'left' | 'right';
export interface Limb {
  hip: Point;
  knee: Point;
  ankle: Point;
  shoulder: Point;
  elbow: Point;
  wrist: Point;
}
export interface Pose {
  pelvis: Point;
  chest: Point;
  neck: Point;
  head: Point;
  left: Limb;
  right: Limb;
  depth: number;
}
const ease = (x: number): number => x * x * x * (x * (x * 6 - 15) + 10);
export function cycleDepth(time: number): number {
  const t = ((time % motion.cycle) + motion.cycle) % motion.cycle;
  if (t < 1.6) return ease(t / 1.6);
  if (t < 1.9) return 1;
  if (t < 3.3) return 1 - ease((t - 1.9) / 1.4);
  return 0;
}
export function poseAt(time: number, loop = false): Pose {
  if (!Number.isFinite(time)) throw new Error('Time must be finite');
  const depth = loop
    ? cycleDepth(time)
    : time < motion.setup || time >= 9
      ? 0
      : cycleDepth(time - motion.setup);
  const shinAngle = depth * 0.64;
  const thighAngle = (-depth * Math.PI) / 2;
  const kneeY = motion.ankleHeight + motion.shin * Math.cos(shinAngle);
  const kneeForward = motion.shin * Math.sin(shinAngle);
  const hipY = kneeY + motion.thigh * Math.cos(thighAngle);
  const hipZ = kneeForward * Math.cos(motion.toeOut) + motion.thigh * Math.sin(thighAngle);
  const lean = depth * 0.6;
  const pelvis: Point = [0, hipY, hipZ];
  const chest: Point = [
    0,
    hipY + motion.torso * Math.cos(lean),
    hipZ + motion.torso * Math.sin(lean),
  ];
  const neck: Point = [0, chest[1] + 0.075, chest[2]];
  const head: Point = [0, neck[1] + 0.115, neck[2]];
  const limb = (sign: number): Limb => {
    const x = (sign * motion.stance) / 2;
    const hipX = x + sign * kneeForward * Math.sin(motion.toeOut);
    const armAngle = depth * 1.85;
    const shoulder: Point = [sign * 0.225, chest[1] - 0.04, chest[2]];
    const elbow: Point = [
      shoulder[0],
      shoulder[1] - motion.upperArm * Math.cos(armAngle),
      shoulder[2] + motion.upperArm * Math.sin(armAngle),
    ];
    const wrist: Point = [
      elbow[0],
      elbow[1] - motion.forearm * Math.cos(armAngle + 0.16),
      elbow[2] + motion.forearm * Math.sin(armAngle + 0.16),
    ];
    return {
      hip: [hipX, hipY, hipZ],
      knee: [hipX, kneeY, kneeForward * Math.cos(motion.toeOut)],
      ankle: [x, motion.ankleHeight, 0],
      shoulder,
      elbow,
      wrist,
    };
  };
  return { pelvis, chest, neck, head, left: limb(-1), right: limb(1), depth };
}
