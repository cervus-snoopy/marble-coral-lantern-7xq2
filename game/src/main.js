// Boot and the one loop: input is read through callbacks, the timer advances
// in real seconds (clamped so a hidden tab never eats the whole clock), and
// the renderer paints what is there. Screens: title, play, paused,
// level-complete, game-over and all-complete.
//
// ?seed=N fixes the scene decorations. ?shot=cover|title|level2|win stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, LEVELS } from './config.js';
import { createAudio, playClick, playError, playFind, playHint, playLose, playWin } from './audio.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { burst, updateParticles } from './particles.js';
import { diffsFor } from './differences.js';
import {
  SCREEN_ALL_COMPLETE,
  SCREEN_GAME_OVER,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  clickAt,
  createState,
  startLevel,
  tick,
  useHint,
} from './state.js';
import { stageShot } from './shots.js';
import { LEFT_X, PANEL_Y, RIGHT_X } from './config.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createState();
const renderer = createRenderer(canvas, { seed });
// Debug/test handle: lets automated play-tests read the live game state.
window.__game = { state };
const particles = renderer.particles;
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const game = { state, particles };
  const screen = stageShot(name, game);
  const best = Math.max(readBest(), state.score);
  let painted = 0;
  function paint() {
    renderer.draw(state, screen, best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, {
    onPanelClick(panel, x, y) {
      if (state.screen !== SCREEN_PLAY) {
        doAction('confirm');
        return;
      }
      const result = clickAt(state, x, y);
      if (result === 'found') {
        const d = diffsFor(state.levelIndex)[state.foundOrder[state.foundOrder.length - 1]];
        burst(particles, LEFT_X + d.x, PANEL_Y + d.y, 26);
        burst(particles, RIGHT_X + d.x, PANEL_Y + d.y, 26);
        playFind(audio);
        if (state.screen === SCREEN_LEVEL_COMPLETE) playWin(audio);
        else if (state.screen === SCREEN_ALL_COMPLETE) playWin(audio);
        announce(`Found ${d.label}. ${state.found.size} of ${LEVELS[state.levelIndex].diffs}.`);
      } else if (result === 'miss') {
        playError(audio);
        announce('Not a difference. Minus 5 seconds.');
      }
    },
    onAction(action) {
      doAction(action);
    },
  });
  void input;

  let screen = SCREEN_TITLE;
  let best = readBest();

  function announce(message) {
    status.textContent = message;
  }

  function refreshScreen() {
    screen = state.screen;
  }

  function doAction(action) {
    if (action === 'confirm') {
      if (screen === SCREEN_TITLE) {
        startLevel(state, 0);
        playClick(audio);
        announce(`Playing. Level 1: ${LEVELS[0].name}.`);
      } else if (screen === SCREEN_LEVEL_COMPLETE) {
        startLevel(state, state.levelIndex + 1);
        playClick(audio);
        announce(`Level ${state.levelIndex + 1}.`);
      } else if (screen === SCREEN_GAME_OVER) {
        startLevel(state, state.levelIndex);
        playClick(audio);
        announce('Trying this level again.');
      } else if (screen === SCREEN_ALL_COMPLETE) {
        startLevel(state, 0);
        playClick(audio);
        announce('Playing again from Level 1.');
      } else if (screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        playClick(audio);
        announce('Playing.');
      }
    } else if (action === 'pause') {
      if (screen === SCREEN_PLAY) {
        state.screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      }
    } else if (action === 'hint') {
      const found = useHint(state);
      if (found >= 0) playHint(audio);
    } else if (action === 'restart') {
      if (screen === SCREEN_PLAY || screen === SCREEN_GAME_OVER || screen === SCREEN_ALL_COMPLETE) {
        startLevel(state, screen === SCREEN_ALL_COMPLETE ? 0 : state.levelIndex);
        playClick(audio);
        announce('Restarted.');
      }
    } else if (action === 'next') {
      if (screen === SCREEN_LEVEL_COMPLETE) {
        startLevel(state, state.levelIndex + 1);
        playClick(audio);
      }
    }
    refreshScreen();
  }

  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    if (tick(state, dt)) {
      playLose(audio);
      announce("Time's up.");
    }
    updateParticles(particles, dt);
    refreshScreen();
    if (state.score > best) {
      best = state.score;
      saveBest(best);
    }
    renderer.draw(state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Tidepool Twins. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
