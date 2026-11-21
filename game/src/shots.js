// Screenshot staging behind ?shot=cover|title|level2|win. Each scene builds a
// real game state — the same state a player would reach by playing — so the
// frame is honest: markers sit on differences that were really "found", the
// counter shows what is really left, and the score is a real score.
import { burst } from './particles.js';
import { diffsFor } from './differences.js';
import {
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PLAY,
  SCREEN_TITLE,
  startLevel,
} from './state.js';
import { LEFT_X, PANEL_Y } from './config.js';

function markFound(game, indices) {
  for (const i of indices) {
    game.state.found.add(i);
    game.state.foundOrder.push(i);
  }
}

function sparkle(game, indices, levelDiffs) {
  for (const i of indices) {
    const d = levelDiffs[i];
    burst(game.particles, LEFT_X + d.x, PANEL_Y + d.y, 18);
  }
}

// Stage one named scene on the live game object and return the screen to draw.
export function stageShot(name, game) {
  const { state } = game;
  if (name === 'title') {
    startLevel(state, 0);
    state.screen = SCREEN_TITLE;
    state.timeLeft = 90;
    return SCREEN_TITLE;
  }
  if (name === 'level2') {
    startLevel(state, 1);
    state.timeLeft = 58;
    state.score = 520;
    state.combo = 2;
    markFound(game, [0, 1]);
    return SCREEN_PLAY;
  }
  if (name === 'win') {
    startLevel(state, 0);
    state.timeLeft = 28;
    state.timeBonus = 280;
    state.score = 1050;
    state.combo = 4;
    state.bestCombo = 4;
    markFound(game, [0, 1, 2, 3, 4, 5, 6]);
    state.screen = SCREEN_LEVEL_COMPLETE;
    return SCREEN_LEVEL_COMPLETE;
  }
  // Default: the cover — level 1 mid-game, 3 found, 4 still to find.
  startLevel(state, 0);
  state.timeLeft = 62;
  state.score = 350;
  state.combo = 2;
  state.bestCombo = 3;
  markFound(game, [0, 2, 4]);
  sparkle(game, [0, 2, 4], diffsFor(0));
  return SCREEN_PLAY;
}
