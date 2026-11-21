// Everything the player sees: the HUD, both panels with their markers, the
// hint pulse, and the title / paused / complete / game-over screens.
import {
  BOTTOM_Y,
  GOLD,
  GOLD_LIGHT,
  HEIGHT,
  HINT_BTN,
  HUD_H,
  INK,
  LEFT_X,
  LEVELS,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  PAUSE_BTN,
  RIGHT_X,
  WIDTH,
} from './config.js';
import { diffsFor } from './differences.js';
import { drawScene } from './scenes.js';
import { drawParticles } from './particles.js';
import {
  SCREEN_ALL_COMPLETE,
  SCREEN_GAME_OVER,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  diffsLeft,
} from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawButton(ctx, rect, label, enabled) {
  ctx.fillStyle = enabled ? '#f5b301' : '#5a6474';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = '#12233d';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
}

function drawMarker(ctx, x, y, r, now) {
  const pulse = 1 + Math.sin(now / 260) * 0.05;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82 + 4, 0, Math.PI * 2);
  ctx.stroke();
  // Check mark.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 0.38, 0);
  ctx.lineTo(-r * 0.08, r * 0.32);
  ctx.lineTo(r * 0.42, -r * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawPanels(ctx, state, seedOffset) {
  const diffs = diffsFor(state.levelIndex);
  const shake = state.now < state.shakeUntil ? 5 : 0;
  const ox = shake ? (Math.random() - 0.5) * shake * 2 : 0;
  const oy = shake ? (Math.random() - 0.5) * shake * 2 : 0;

  for (const [panelX, variant, tag] of [[LEFT_X, 0, 'ORIGINAL'], [RIGHT_X, 1, 'CHANGED']]) {
    ctx.save();
    ctx.translate(panelX + ox, PANEL_Y + oy);
    drawScene(ctx, state.levelIndex, variant, seedOffset);
    // Found markers on both panels.
    for (const i of state.found) {
      const d = diffs[i];
      drawMarker(ctx, d.x, d.y, d.r, state.now);
    }
    // Hint pulse on the next unfound difference.
    if (state.hintPulse && state.now < state.hintPulse.until) {
      const d = diffs[state.hintPulse.diffIndex];
      const pr = d.r * (0.9 + Math.sin(state.now / 120) * 0.18);
      ctx.strokeStyle = '#ff5a8a';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, pr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    // Panel frame + tag.
    ctx.strokeStyle = '#0e1a2e';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX - 2, PANEL_Y - 2, PANEL_W + 4, PANEL_H + 4);
    ctx.fillStyle = variant === 0 ? '#2b6fd9' : '#c22f6e';
    roundRect(ctx, panelX + 14, PANEL_Y - 16, 108, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, panelX + 68, PANEL_Y);
  }

  // Centre divider: "spot the difference" reminder.
  ctx.fillStyle = '#12233d';
  ctx.fillRect(LEFT_X + PANEL_W + 4, PANEL_Y, 32, PANEL_H);
  ctx.save();
  ctx.translate(LEFT_X + PANEL_W + 20, PANEL_Y + PANEL_H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPOT THE DIFFERENCE', 0, 5);
  ctx.restore();
}

function drawHud(ctx, state, best) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, WIDTH, HUD_H);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, HUD_H - 4, WIDTH, 4);

  const level = LEVELS[state.levelIndex];
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9fb4d8';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`LEVEL ${state.levelIndex + 1} OF ${LEVELS.length}  ·  ${level.name.toUpperCase()}`, 20, 26);

  const left = diffsLeft(state);
  ctx.fillStyle = left === 0 ? '#7be495' : GOLD_LIGHT;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText(`Differences left: ${left}`, 20, 62);

  // Timer bar in the middle.
  const barX = 470;
  const barW = 300;
  const frac = Math.max(0, state.timeLeft / level.time);
  const low = state.timeLeft <= 15;
  ctx.fillStyle = '#2c3a5e';
  roundRect(ctx, barX, 18, barW, 22, 11);
  ctx.fill();
  ctx.fillStyle = low ? '#ff5a5a' : frac < 0.4 ? '#ffb02e' : '#7be495';
  if (frac > 0) {
    roundRect(ctx, barX, 18, Math.max(22, barW * frac), 22, 11);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(state.timeLeft)}s`, barX + barW / 2, 55);

  // Score.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`Score ${state.score}`, 1010, 32);
  ctx.fillStyle = '#9fb4d8';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(`Best ${best}   Combo x${Math.max(1, state.combo)}`, 1010, 56);

  drawButton(ctx, HINT_BTN, `Hint (H) ×${state.hintsLeft}`, state.hintsLeft > 0);
  drawButton(ctx, PAUSE_BTN, 'Pause (P)', true);
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, BOTTOM_Y, WIDTH, HEIGHT - BOTTOM_Y);
  // Level dots.
  for (let i = 0; i < LEVELS.length; i += 1) {
    ctx.fillStyle = i < state.levelIndex ? '#7be495' : i === state.levelIndex ? GOLD : '#5a6474';
    ctx.beginPath();
    ctx.arc(30 + i * 26, BOTTOM_Y + 34, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#9fb4d8';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('H hint · P pause · R restart', 120, BOTTOM_Y + 39);
  const msg = state.now < state.messageUntil ? state.message : 'Click a difference on either panel — wrong clicks cost 5 seconds.';
  ctx.fillStyle = '#ffffff';
  ctx.font = '17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(msg, WIDTH / 2 + 60, BOTTOM_Y + 39);
}

function overlay(ctx, title, lines, accent = GOLD) {
  ctx.fillStyle = 'rgba(10, 18, 36, 0.78)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText(title, WIDTH / 2, 300);
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, WIDTH / 2, 360 + i * 38));
}

export function createRenderer(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const particles = { list: [] };
  const seedOffset = (options.seed ?? 0) % 1000;

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#0e1a2e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawHud(ctx, state, best);
    drawPanels(ctx, state, seedOffset);
    drawParticles(ctx, particles);
    drawBottomBar(ctx, state);

    // Red flash on a wrong click.
    if (state.now < state.flashUntil) {
      ctx.fillStyle = 'rgba(255, 60, 60, 0.18)';
      ctx.fillRect(0, HUD_H, WIDTH, PANEL_H + 4);
    }

    if (screen === SCREEN_TITLE) {
      overlay(ctx, 'TIDEPOOL TWINS', [
        'Two pictures. One is hiding changes. Find them all!',
        '3 scenes · 25 differences · hints, combos and a ticking clock',
        'Click or press Space to start',
        best > 0 ? `Best score: ${best}` : 'Your first hunt awaits…',
      ]);
    } else if (screen === SCREEN_PAUSED) {
      overlay(ctx, 'PAUSED', ['Take a breath — the clock is stopped.', 'Press P or click to keep hunting.'], '#9fb4d8');
    } else if (screen === SCREEN_LEVEL_COMPLETE) {
      const level = LEVELS[state.levelIndex];
      overlay(ctx, 'LEVEL COMPLETE!', [
        `${level.name} — ${level.diffs}/${level.diffs} differences found`,
        `Time bonus +${state.timeBonus}   ·   Score ${state.score}`,
        'Press N or click for the next level',
      ], '#7be495');
    } else if (screen === SCREEN_GAME_OVER) {
      overlay(ctx, "TIME'S UP!", [
        `${LEVELS[state.levelIndex].name}: you found ${state.found.size} of ${LEVELS[state.levelIndex].diffs}`,
        `Score ${state.score}   ·   Best ${best}`,
        'Press R or click to try this level again',
      ], '#ff5a5a');
    } else if (screen === SCREEN_ALL_COMPLETE) {
      overlay(ctx, 'YOU FOUND THEM ALL!', [
        `All 3 scenes cleared — ${state.score} points`,
        `Best combo x${state.bestCombo}   ·   ${state.mistakes} wrong clicks`,
        'Press R or click to play again from Level 1',
      ], '#7be495');
    }
  }

  return { draw, particles };
}
