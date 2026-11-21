// Difference definitions, one list per level. Coordinates are in panel space
// (600 x 636); the same spot is checked on both panels. `kind` names how the
// right panel changes the left one, `label` is the friendly name shown when
// the difference is found. Radii are generous on purpose: a click near the
// spot counts, so the hunt is about seeing, not pixel-perfect aiming.
export const DIFFS = [
  // Level 1 — Tidepool Morning (7)
  [
    { x: 92, y: 84, r: 52, kind: 'detail', label: 'Sun rays' },
    { x: 430, y: 545, r: 36, kind: 'missing', label: 'Crab claw' },
    { x: 150, y: 540, r: 34, kind: 'color', label: 'Starfish colour' },
    { x: 300, y: 562, r: 34, kind: 'count', label: 'Shell count' },
    { x: 468, y: 182, r: 34, kind: 'flipped', label: 'Fish direction' },
    { x: 520, y: 522, r: 34, kind: 'color', label: 'Bucket colour' },
    { x: 250, y: 428, r: 38, kind: 'size', label: 'Seaweed height' },
  ],
  // Level 2 — Night Market (8)
  [
    { x: 122, y: 152, r: 32, kind: 'color', label: 'Lantern colour' },
    { x: 520, y: 86, r: 38, kind: 'detail', label: 'Moon phase' },
    { x: 300, y: 152, r: 42, kind: 'detail', label: 'Shop sign' },
    { x: 180, y: 428, r: 34, kind: 'count', label: 'Apple count' },
    { x: 482, y: 540, r: 32, kind: 'missing', label: 'Market cat' },
    { x: 170, y: 236, r: 42, kind: 'count', label: 'Awning stripes' },
    { x: 200, y: 70, r: 26, kind: 'missing', label: 'Little star' },
    { x: 330, y: 292, r: 32, kind: 'color', label: 'Vendor hat' },
  ],
  // Level 3 — Star Observatory (10)
  [
    { x: 122, y: 152, r: 46, kind: 'detail', label: 'Planet rings' },
    { x: 300, y: 332, r: 48, kind: 'flipped', label: 'Telescope aim' },
    { x: 520, y: 102, r: 36, kind: 'detail', label: 'Clock time' },
    { x: 150, y: 522, r: 32, kind: 'count', label: 'Book stack' },
    { x: 482, y: 502, r: 34, kind: 'count', label: 'Rocket fins' },
    { x: 250, y: 92, r: 26, kind: 'color', label: 'Wall star' },
    { x: 400, y: 152, r: 40, kind: 'count', label: 'Chart dots' },
    { x: 82, y: 322, r: 36, kind: 'missing', label: 'Window moon' },
    { x: 300, y: 62, r: 30, kind: 'detail', label: 'Dome light' },
    { x: 522, y: 302, r: 36, kind: 'missing', label: 'Comet' },
  ],
];

export function diffsFor(levelIndex) {
  return DIFFS[levelIndex] ?? DIFFS[0];
}
