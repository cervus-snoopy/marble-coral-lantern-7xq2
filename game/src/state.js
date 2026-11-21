// Game state and the rules that change it: finding, missing, hints, the
// timer and scoring. Rendering never mutates state; input calls these
// functions and reads back what happened.
import {
  COMBO_STEP,
  FIND_POINTS,
  HINTS_PER_LEVEL,
  HINT_COOLDOWN_MS,
  HINT_PULSE_MS,
  LEVELS,
  TIME_BONUS_PER_SEC,
  WRONG_PENALTY_SEC,
} from './config.js';
import { diffsFor } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_COMPLETE = 'level-complete';
export const SCREEN_GAME_OVER = 'game-over';
export const SCREEN_ALL_COMPLETE = 'all-complete';

export function createState() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    foundOrder: [],
    lastFoundLabel: '',
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    score: 0,
    timeLeft: LEVELS[0].time,
    timeBonus: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintCooldownUntil: 0,
    hintPulse: null, // { diffIndex, until }
    shakeUntil: 0,
    flashUntil: 0,
    message: '',
    messageUntil: 0,
    now: 0,
  };
}

export function startLevel(state, levelIndex) {
  state.levelIndex = levelIndex;
  state.found = new Set();
  state.foundOrder = [];
  state.lastFoundLabel = '';
  state.mistakes = 0;
  state.combo = 0;
  state.timeLeft = LEVELS[levelIndex].time;
  state.timeBonus = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintCooldownUntil = 0;
  state.hintPulse = null;
  state.shakeUntil = 0;
  state.flashUntil = 0;
  state.screen = SCREEN_PLAY;
  setMessage(state, `Level ${levelIndex + 1}: ${LEVELS[levelIndex].name} — find ${LEVELS[levelIndex].diffs} differences!`, 4000);
}

export function setMessage(state, text, ms = 2500) {
  state.message = text;
  state.messageUntil = state.now + ms;
}

export function diffsLeft(state) {
  return LEVELS[state.levelIndex].diffs - state.found.size;
}

// A click at panel coordinates (x, y). Returns 'found' | 'miss' | 'ignored'.
export function clickAt(state, x, y) {
  if (state.screen !== SCREEN_PLAY) return 'ignored';
  const diffs = diffsFor(state.levelIndex);
  for (let i = 0; i < diffs.length; i += 1) {
    if (state.found.has(i)) continue;
    const d = diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      state.found.add(i);
      state.foundOrder.push(i);
      state.lastFoundLabel = d.label;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const gained = FIND_POINTS + (state.combo - 1) * COMBO_STEP;
      state.score += gained;
      setMessage(state, `Found: ${d.label}! +${gained}${state.combo > 1 ? ` (combo x${state.combo})` : ''}`);
      if (state.found.size === diffs.length) {
        state.timeBonus = Math.ceil(state.timeLeft) * TIME_BONUS_PER_SEC;
        state.score += state.timeBonus;
        state.screen = state.levelIndex === LEVELS.length - 1 ? SCREEN_ALL_COMPLETE : SCREEN_LEVEL_COMPLETE;
      }
      return 'found';
    }
  }
  // A miss: combo breaks and five seconds come off the clock.
  state.combo = 0;
  state.mistakes += 1;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY_SEC);
  state.shakeUntil = state.now + 250;
  state.flashUntil = state.now + 200;
  setMessage(state, `Not a difference — minus ${WRONG_PENALTY_SEC}s!`);
  if (state.timeLeft <= 0) state.screen = SCREEN_GAME_OVER;
  return 'miss';
}

// Spend one hint: pulse the first still-hidden difference. Returns the diff
// index, or -1 when no hint is available (none left, cooling down, not playing).
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return -1;
  if (state.hintsLeft <= 0) {
    setMessage(state, 'No hints left on this level!');
    return -1;
  }
  if (state.now < state.hintCooldownUntil) {
    setMessage(state, 'Hint is recharging…');
    return -1;
  }
  const diffs = diffsFor(state.levelIndex);
  for (let i = 0; i < diffs.length; i += 1) {
    if (!state.found.has(i)) {
      state.hintsLeft -= 1;
      state.hintCooldownUntil = state.now + HINT_COOLDOWN_MS;
      state.hintPulse = { diffIndex: i, until: state.now + HINT_PULSE_MS };
      setMessage(state, 'Hint: look where the ring is pulsing!');
      return i;
    }
  }
  return -1;
}

// Advance the clock by dt seconds. Returns true when time just ran out.
export function tick(state, dt) {
  state.now += dt * 1000;
  if (state.screen !== SCREEN_PLAY) return false;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_GAME_OVER;
    return true;
  }
  return false;
}
