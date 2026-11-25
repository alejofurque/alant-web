/**
 * Stage compositions, in em (1em = 1/48 of a plane width). Mirrored by the
 * static CSS poses in showcase-stage.css, which are the reduced-motion and
 * pre-hydration composition. Keep both in sync.
 */
export interface Pose {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
  o?: number;
  /** Depth shade over the face (0–1): distant planes stay solid but recede. */
  d?: number;
}
export interface StagePose {
  assembly: Pose;
  web: Pose;
  system: Pose;
  flow: Pose;
  floor: Pose;
}

const front: Pose = { x: -4, y: 3, z: 10, o: 1, d: 0 };
const queued: Pose = { x: 4, y: -6, z: -14, o: 1, d: 0.55 };
const last: Pose = { x: 8, y: -12, z: -28, o: 1, d: 0.78 };
const gone: Pose = { x: -4, y: -26, z: -22, o: 0, d: 0.3 };
const presentation: Pose = { x: 0, y: 0, rx: 8, ry: -16, rz: 0, s: 1.14 };

export const STAGE_POSES: readonly StagePose[] = [
  {
    // 00 — Sculpture: three products resting on a measured drafting floor.
    assembly: { x: 2.5, y: 3, rx: 56, ry: 0, rz: -36, s: 1 },
    web: { x: -3, y: -4, z: 16, o: 1 },
    system: { x: 0, y: 0, z: 8, o: 1 },
    flow: { x: 3, y: 4, z: 0, o: 1 },
    floor: { o: 1 },
  },
  { assembly: presentation, web: front, system: queued, flow: last, floor: { o: 0 } },
  { assembly: presentation, web: gone, system: front, flow: queued, floor: { o: 0 } },
  { assembly: presentation, web: gone, system: gone, flow: front, floor: { o: 0 } },
];

export type StagePart = keyof StagePose;
export const STAGE_PARTS: readonly StagePart[] = ['assembly', 'web', 'system', 'flow', 'floor'];
