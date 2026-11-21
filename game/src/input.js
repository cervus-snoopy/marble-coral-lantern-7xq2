// Mouse and keyboard input. Pointer coordinates are mapped from the page
// into the game's logical 1280x800 space, so the game plays the same at any
// window size. Callbacks: onPanelClick(panel, x, y), onAction(action) where
// action is 'confirm' | 'pause' | 'hint' | 'restart' | 'next'.
import { HINT_BTN, LEFT_X, PANEL_H, PANEL_W, PANEL_Y, PAUSE_BTN, RIGHT_X, WIDTH, HEIGHT } from './config.js';

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function createInput(canvas, hooks) {
  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }

  function panelAt(x, y) {
    if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
    if (x >= LEFT_X && x <= LEFT_X + PANEL_W) return { panel: 0, x: x - LEFT_X, y: y - PANEL_Y };
    if (x >= RIGHT_X && x <= RIGHT_X + PANEL_W) return { panel: 1, x: x - RIGHT_X, y: y - PANEL_Y };
    return null;
  }

  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toLogical(event);
    if (inRect(x, y, HINT_BTN)) {
      hooks.onAction('hint');
      return;
    }
    if (inRect(x, y, PAUSE_BTN)) {
      hooks.onAction('pause');
      return;
    }
    const hit = panelAt(x, y);
    if (hit) hooks.onPanelClick(hit.panel, hit.x, hit.y);
    else hooks.onAction('confirm');
  });

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      hooks.onAction('confirm');
    } else if (key === 'h') hooks.onAction('hint');
    else if (key === 'p' || key === 'escape') hooks.onAction('pause');
    else if (key === 'r') hooks.onAction('restart');
    else if (key === 'n') hooks.onAction('next');
  });

  return {};
}
