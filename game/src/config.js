// Shared constants for Tidepool Twins: sizes, levels, scoring and tuning.
// One place for every number the rest of the game agrees on.
export const WIDTH = 1280;
export const HEIGHT = 800;
export const HUD_H = 76;
export const PANEL_W = 600;
export const PANEL_H = 636;
export const PANEL_Y = 92;
export const LEFT_X = 20;
export const RIGHT_X = 660;
export const BOTTOM_Y = PANEL_Y + PANEL_H; // 728

// HUD buttons (logical canvas coordinates, used by both render and input).
export const HINT_BTN = { x: 1030, y: 14, w: 108, h: 46 };
export const PAUSE_BTN = { x: 1150, y: 14, w: 108, h: 46 };

export const LEVELS = [
  { name: 'Tidepool Morning', diffs: 7, time: 90, seed: 101 },
  { name: 'Night Market', diffs: 8, time: 75, seed: 202 },
  { name: 'Star Observatory', diffs: 10, time: 60, seed: 303 },
];

export const FIND_POINTS = 100;
export const COMBO_STEP = 25; // extra points per combo step beyond the first find
export const TIME_BONUS_PER_SEC = 10;
export const WRONG_PENALTY_SEC = 5;
export const HINTS_PER_LEVEL = 3;
export const HINT_COOLDOWN_MS = 8000;
export const HINT_PULSE_MS = 2600;

export const BEST_KEY = 'tidepool-twins-best';

export const GOLD = '#f5b301';
export const GOLD_LIGHT = '#ffd94d';
export const INK = '#12233d';
export const PAPER = '#fdf6e3';
