// The three scenes, drawn entirely with Canvas 2D. Each draw function takes
// `variant`: 0 paints the left (original) panel, 1 paints the right (altered)
// panel. Everything shared between the panels is drawn identically from the
// same seeded rng, so only the listed differences ever change.
import { createRandom, range } from './random.js';

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function star(ctx, x, y, r, points = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function scallop(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * r * 0.45, y - r * 0.15);
    ctx.lineTo(x + i * r * 0.45, y - r * 0.9);
    ctx.stroke();
  }
}

function fish(ctx, x, y, size, facing, body, belly) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, 0);
  ctx.lineTo(-size * 1.5, -size * 0.6);
  ctx.lineTo(-size * 1.5, size * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(size * 0.2, size * 0.2, size * 0.5, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12233d';
  ctx.beginPath();
  ctx.arc(size * 0.55, -size * 0.12, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- Level 1
function drawTidepool(ctx, variant, rng) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#8fd0f5');
  sky.addColorStop(1, '#dff4ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 300);

  // Sun: rays in the original, a bare disc in the altered panel.
  ctx.fillStyle = '#ffcf3d';
  if (variant === 0) {
    ctx.strokeStyle = '#ffcf3d';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(92 + Math.cos(a) * 52, 84 + Math.sin(a) * 52);
      ctx.lineTo(92 + Math.cos(a) * 68, 84 + Math.sin(a) * 68);
      ctx.stroke();
    }
  }
  ellipse(ctx, 92, 84, 42, 42);

  // Clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ellipse(ctx, 250, 70, 62, 20);
  ellipse(ctx, 285, 58, 46, 18);
  ellipse(ctx, 470, 110, 56, 18);
  ellipse(ctx, 500, 98, 40, 15);

  // Sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 470);
  sea.addColorStop(0, '#37b3d6');
  sea.addColorStop(1, '#1b7f9e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 600, 170);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 4;
  for (const wy of [330, 380, 430]) {
    ctx.beginPath();
    for (let x = 0; x <= 600; x += 20) {
      const y = wy + Math.sin(x / 55 + wy) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // The fish: same spot, opposite direction.
  fish(ctx, 468, 182, 26, variant === 0 ? 1 : -1, '#ff8a5c', '#ffd9a8');

  // Bubbles rising from the sand.
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const bx = range(rng, 30, 570);
    const by = range(rng, 320, 460);
    const br = range(rng, 3, 8);
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sand.
  const sand = ctx.createLinearGradient(0, 470, 0, 636);
  sand.addColorStop(0, '#f2d8a0');
  sand.addColorStop(1, '#e0bd76');
  ctx.fillStyle = sand;
  ctx.fillRect(0, 470, 600, 166);
  ctx.fillStyle = 'rgba(160,120,60,0.5)';
  for (let i = 0; i < 26; i += 1) ellipse(ctx, range(rng, 10, 590), range(rng, 480, 625), 3, 2);

  // Rocks.
  ctx.fillStyle = '#8d97a5';
  ellipse(ctx, 60, 600, 52, 26);
  ellipse(ctx, 545, 614, 45, 22);
  ctx.fillStyle = '#7a8494';
  ellipse(ctx, 60, 594, 30, 14);

  // Seaweed: tall in the original, cut short in the altered panel.
  const top = variant === 0 ? 330 : 392;
  ctx.strokeStyle = '#2e8b57';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  for (const [sx, sway] of [[236, -14], [252, 0], [268, 14]]) {
    ctx.beginPath();
    ctx.moveTo(sx, 470);
    ctx.quadraticCurveTo(sx + sway, 430, sx + sway * 1.6, top);
    ctx.stroke();
  }

  // Crab: both claws in the original, one claw missing in the altered panel.
  ctx.fillStyle = '#e2543e';
  ellipse(ctx, 430, 545, 34, 24);
  ctx.strokeStyle = '#e2543e';
  ctx.lineWidth = 6;
  for (const leg of [-1, 1]) {
    for (const ly of [538, 548, 558]) {
      ctx.beginPath();
      ctx.moveTo(430 + leg * 30, ly);
      ctx.lineTo(430 + leg * 46, ly + 8);
      ctx.stroke();
    }
  }
  // Claws.
  ellipse(ctx, 462, 528, 12, 9);
  if (variant === 0) ellipse(ctx, 398, 528, 12, 9);
  // Eyes on stalks.
  ctx.strokeStyle = '#e2543e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(420, 524);
  ctx.lineTo(418, 512);
  ctx.moveTo(440, 524);
  ctx.lineTo(442, 512);
  ctx.stroke();
  ctx.fillStyle = '#12233d';
  ellipse(ctx, 418, 510, 4, 5);
  ellipse(ctx, 442, 510, 4, 5);

  // Starfish: orange in the original, purple in the altered panel.
  ctx.fillStyle = variant === 0 ? '#ff7f2a' : '#9b59d0';
  star(ctx, 150, 540, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 5; i += 1) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    ellipse(ctx, 150 + Math.cos(a) * 12, 540 + Math.sin(a) * 12, 3, 3);
  }

  // Shells: three in the original, two in the altered panel.
  scallop(ctx, 278, 566, 18, '#fff2f2');
  if (variant === 0) scallop(ctx, 304, 560, 20, '#ffe1a8');
  scallop(ctx, 330, 566, 18, '#ffd6e8');

  // Bucket: red in the original, blue in the altered panel.
  ctx.fillStyle = variant === 0 ? '#d93b2b' : '#2b6fd9';
  ctx.beginPath();
  ctx.moveTo(500, 500);
  ctx.lineTo(540, 500);
  ctx.lineTo(534, 548);
  ctx.lineTo(506, 548);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(520, 500, 18, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#f2d8a0';
  ctx.fillRect(500, 500, 40, 6);
}

// ---------------------------------------------------------------- Level 2
function drawLantern(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x - 13, y, 26, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(x - 13, y + 8, 26, 4);
  ctx.fillRect(x - 13, y + 22, 26, 4);
  ctx.fillStyle = '#8a6d2b';
  ctx.fillRect(x - 6, y - 6, 12, 6);
  ctx.fillRect(x - 6, y + 34, 12, 5);
}

function drawNightMarket(ctx, variant, rng) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, '#131a38');
  sky.addColorStop(1, '#2c2a55');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 520);

  // Stars, one of which is missing in the altered panel.
  ctx.fillStyle = '#fff6c9';
  for (let i = 0; i < 34; i += 1) {
    const sx = range(rng, 15, 585);
    const sy = range(rng, 15, 200);
    ellipse(ctx, sx, sy, range(rng, 1.5, 3), range(rng, 1.5, 3));
  }
  if (variant === 0) {
    star(ctx, 200, 70, 9, 4, 0.35);
  }

  // Moon: crescent in the original, full in the altered panel.
  ctx.fillStyle = '#ffe9a8';
  if (variant === 1) {
    ellipse(ctx, 520, 86, 34, 34);
  } else {
    ctx.beginPath();
    ctx.arc(520, 86, 34, Math.PI * 0.12, Math.PI * 1.38);
    ctx.arc(537, 76, 27, Math.PI * 1.38, Math.PI * 0.12, true);
    ctx.closePath();
    ctx.fill();
  }

  // Lantern string.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 118);
  ctx.quadraticCurveTo(300, 150, 570, 118);
  ctx.stroke();
  const lanternColors = ['#e23b2e', '#ffb02e', '#e23b2e', '#2fae6e', '#e23b2e', '#ffb02e'];
  for (let i = 0; i < 6; i += 1) {
    const lx = 70 + i * 92;
    const ly = 128 + Math.sin((lx / 600) * Math.PI) * 8;
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx, ly + 12);
    ctx.stroke();
    // The second lantern changes colour between panels.
    const color = i === 1 ? (variant === 0 ? '#e23b2e' : '#2fae6e') : lanternColors[i];
    drawLantern(ctx, lx, ly + 12, color);
  }

  // Hanging shop sign: OPEN in the original, CLOSED in the altered panel.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 96);
  ctx.lineTo(300, 122);
  ctx.stroke();
  ctx.fillStyle = '#f7ead0';
  ctx.beginPath();
  ctx.roundRect(245, 122, 110, 58, 8);
  ctx.fill();
  ctx.strokeStyle = '#8a6d2b';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = variant === 0 ? '#1f8a4c' : '#c22f2f';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(variant === 0 ? 'OPEN' : 'CLOSED', 300, 152);

  // Stall awnings.
  function awning(x0, x1, y, colors, stripes) {
    const w = (x1 - x0) / stripes;
    for (let i = 0; i < stripes; i += 1) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(x0 + i * w, y);
      ctx.lineTo(x0 + (i + 1) * w, y);
      ctx.lineTo(x0 + (i + 1) * w, y + 34);
      ctx.arc(x0 + (i + 0.5) * w, y + 34, w / 2, 0, Math.PI);
      ctx.lineTo(x0 + i * w, y + 34);
      ctx.closePath();
      ctx.fill();
    }
  }
  // Left awning: five stripes in the original, four in the altered panel.
  awning(60, 280, 212, ['#d93b2b', '#f7ead0'], variant === 0 ? 5 : 4);
  // Right awning is identical in both panels.
  awning(340, 560, 212, ['#2fae6e', '#f7ead0'], 5);

  // Stall counters.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(60, 420, 220, 16);
  ctx.fillRect(340, 420, 220, 16);
  ctx.fillStyle = '#8a6d2b';
  ctx.fillRect(60, 436, 220, 60);
  ctx.fillRect(340, 436, 220, 60);

  // Apples on the left counter: four in the original, three in the altered.
  ctx.fillStyle = '#e23b2e';
  const appleXs = variant === 0 ? [110, 150, 190, 230] : [110, 150, 230];
  for (const ax of appleXs) {
    ellipse(ctx, ax, 404, 16, 15);
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax, 390);
    ctx.lineTo(ax + 3, 382);
    ctx.stroke();
  }
  // Oranges on the right counter (identical).
  ctx.fillStyle = '#ff8a2a';
  for (const ox of [400, 440, 480, 520]) ellipse(ctx, ox, 404, 15, 14);

  // Vendor behind the right counter: hat colour changes between panels.
  ctx.fillStyle = '#f2c9a0';
  ellipse(ctx, 330, 330, 26, 30); // head
  ctx.fillStyle = '#3b6fd9';
  ctx.beginPath();
  ctx.moveTo(296, 360);
  ctx.lineTo(364, 360);
  ctx.lineTo(356, 420);
  ctx.lineTo(304, 420);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = variant === 0 ? '#d93b2b' : '#2b6fd9';
  ctx.beginPath();
  ctx.arc(330, 306, 26, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(300, 300, 60, 8);
  ctx.fillStyle = '#12233d';
  ellipse(ctx, 320, 328, 3, 4);
  ellipse(ctx, 340, 328, 3, 4);

  // Street.
  ctx.fillStyle = '#3a2f4a';
  ctx.fillRect(0, 520, 600, 116);
  ctx.fillStyle = 'rgba(255,220,120,0.12)';
  ellipse(ctx, 300, 560, 200, 26);
  // Crates and baskets.
  ctx.fillStyle = '#7a5a34';
  ctx.fillRect(40, 540, 52, 44);
  ctx.fillRect(96, 552, 44, 32);
  ctx.fillStyle = '#a87c4a';
  ellipse(ctx, 560, 566, 30, 20);

  // The market cat: sitting on the street in the original, gone in the altered.
  if (variant === 0) {
    ctx.fillStyle = '#2b2b3a';
    ellipse(ctx, 482, 556, 22, 26);
    ellipse(ctx, 482, 520, 15, 15);
    ctx.beginPath();
    ctx.moveTo(470, 510);
    ctx.lineTo(474, 496);
    ctx.lineTo(480, 508);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(484, 508);
    ctx.lineTo(490, 496);
    ctx.lineTo(494, 510);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(500, 570);
    ctx.quadraticCurveTo(528, 566, 524, 544);
    ctx.quadraticCurveTo(520, 560, 502, 560);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ellipse(ctx, 477, 518, 2.5, 3);
    ellipse(ctx, 487, 518, 2.5, 3);
  }
}

// ---------------------------------------------------------------- Level 3
function drawObservatory(ctx, variant, rng) {
  // Wall and dome.
  const wall = ctx.createLinearGradient(0, 0, 0, 520);
  wall.addColorStop(0, '#24355e');
  wall.addColorStop(1, '#121b33');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 600, 520);
  ctx.strokeStyle = '#3d5178';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(300, 540, 420, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Dome light: glowing in the original, dark in the altered panel.
  ctx.fillStyle = '#8a6d2b';
  ctx.fillRect(286, 40, 28, 10);
  if (variant === 0) {
    const glow = ctx.createRadialGradient(300, 62, 4, 300, 62, 70);
    glow.addColorStop(0, 'rgba(255,220,120,0.85)');
    glow.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(230, -8, 140, 140);
    ctx.fillStyle = 'rgba(255,220,120,0.25)';
    ctx.beginPath();
    ctx.moveTo(282, 72);
    ctx.lineTo(318, 72);
    ctx.lineTo(350, 200);
    ctx.lineTo(250, 200);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
  } else {
    ctx.fillStyle = '#4a4a55';
  }
  ellipse(ctx, 300, 62, 14, 12);

  // Saturn poster: rings in the original, none in the altered panel.
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(66, 96, 112, 112);
  ctx.fillStyle = '#1d2b4d';
  ctx.fillRect(72, 102, 100, 100);
  ctx.fillStyle = '#e8b45a';
  ellipse(ctx, 122, 152, 26, 26);
  if (variant === 0) {
    ctx.strokeStyle = '#e8d28a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(122, 152, 42, 12, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#f7ead0';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('SATURN', 122, 196);

  // Star chart: five dots in the original, four in the altered panel.
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(344, 96, 112, 112);
  ctx.fillStyle = '#12233d';
  ctx.fillRect(350, 102, 100, 100);
  const dots = variant === 0
    ? [[368, 130], [392, 118], [414, 138], [380, 168], [428, 172]]
    : [[368, 130], [392, 118], [414, 138], [380, 168]];
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  dots.forEach(([dx, dy], i) => {
    if (i === 0) ctx.moveTo(dx, dy);
    else ctx.lineTo(dx, dy);
  });
  ctx.stroke();
  ctx.fillStyle = '#fff6c9';
  for (const [dx, dy] of dots) ellipse(ctx, dx, dy, 4, 4);

  // Wall star: yellow in the original, blue in the altered panel.
  ctx.fillStyle = variant === 0 ? '#ffd94d' : '#5aa8ff';
  star(ctx, 250, 92, 16);

  // Window with the moon: present in the original, absent in the altered.
  ctx.fillStyle = '#0d1526';
  ctx.fillRect(44, 272, 76, 100);
  ctx.strokeStyle = '#8a6d2b';
  ctx.lineWidth = 4;
  ctx.strokeRect(44, 272, 76, 100);
  ctx.beginPath();
  ctx.moveTo(82, 272);
  ctx.lineTo(82, 372);
  ctx.moveTo(44, 322);
  ctx.lineTo(120, 322);
  ctx.stroke();
  ctx.fillStyle = '#fff6c9';
  ellipse(ctx, 58, 292, 2, 2);
  ellipse(ctx, 106, 352, 2, 2);
  if (variant === 0) {
    ctx.fillStyle = '#ffe9a8';
    ellipse(ctx, 100, 292, 12, 12);
  }

  // Comet: streaking in the original, gone in the altered panel.
  if (variant === 0) {
    const streak = ctx.createLinearGradient(470, 302, 540, 302);
    streak.addColorStop(0, 'rgba(255,255,255,0)');
    streak.addColorStop(1, 'rgba(180,220,255,0.9)');
    ctx.strokeStyle = streak;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(468, 302);
    ctx.lineTo(536, 302);
    ctx.stroke();
    ctx.fillStyle = '#eaf4ff';
    ellipse(ctx, 540, 302, 9, 9);
  }

  // Clock: 3:00 in the original, 5:00 in the altered panel.
  ctx.fillStyle = '#f7ead0';
  ellipse(ctx, 520, 102, 32, 32);
  ctx.strokeStyle = '#8a6d2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(520, 102, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#12233d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(520, 102);
  ctx.lineTo(520, 82); // minute hand: 12 in both
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(520, 102);
  if (variant === 0) ctx.lineTo(540, 102); // hour hand: 3
  else ctx.lineTo(532, 118); // hour hand: 5
  ctx.stroke();

  // Telescope: aimed up in the original, drooping down in the altered panel.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(300, 380);
  ctx.lineTo(262, 470);
  ctx.moveTo(300, 380);
  ctx.lineTo(338, 470);
  ctx.moveTo(300, 380);
  ctx.lineTo(300, 470);
  ctx.stroke();
  ctx.save();
  ctx.translate(300, 372);
  ctx.rotate(variant === 0 ? -0.6 : 0.45);
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath();
  ctx.roundRect(-14, -95, 28, 110, 10);
  ctx.fill();
  ctx.fillStyle = '#3b6fd9';
  ctx.beginPath();
  ctx.roundRect(-18, -105, 36, 22, 8);
  ctx.fill();
  ctx.fillStyle = '#12233d';
  ellipse(ctx, 0, -100, 10, 8);
  ctx.restore();
  ctx.fillStyle = '#8a6d2b';
  ellipse(ctx, 300, 378, 14, 10);

  // Floor.
  ctx.fillStyle = '#2c3a5e';
  ctx.fillRect(0, 520, 600, 116);
  ctx.fillStyle = '#7a2e3d';
  ellipse(ctx, 300, 590, 150, 34);
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(300, 590, 132, 26, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Book stack: three books in the original, two in the altered panel.
  const books = variant === 0
    ? [[120, 540, 60, 14, '#c22f2f'], [126, 526, 52, 14, '#2b6fd9'], [132, 512, 44, 14, '#2fae6e']]
    : [[120, 540, 60, 14, '#c22f2f'], [126, 526, 52, 14, '#2b6fd9']];
  for (const [bx, by, bw, bh, bc] of books) {
    ctx.fillStyle = bc;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#f7ead0';
    ctx.fillRect(bx + bw - 8, by + 2, 4, bh - 4);
  }

  // Rocket model: three fins in the original, two in the altered panel.
  ctx.fillStyle = '#e8e8ee';
  ctx.beginPath();
  ctx.moveTo(482, 452);
  ctx.quadraticCurveTo(498, 470, 498, 500);
  ctx.lineTo(466, 500);
  ctx.quadraticCurveTo(466, 470, 482, 452);
  ctx.fill();
  ctx.fillStyle = '#d93b2b';
  ctx.beginPath();
  ctx.moveTo(482, 452);
  ctx.quadraticCurveTo(490, 462, 490, 472);
  ctx.lineTo(474, 472);
  ctx.quadraticCurveTo(474, 462, 482, 452);
  ctx.fill();
  ctx.fillStyle = '#d93b2b';
  ctx.beginPath();
  ctx.moveTo(466, 488);
  ctx.lineTo(452, 512);
  ctx.lineTo(466, 506);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(498, 488);
  ctx.lineTo(512, 512);
  ctx.lineTo(498, 506);
  ctx.closePath();
  ctx.fill();
  if (variant === 0) {
    ctx.beginPath();
    ctx.moveTo(482, 500);
    ctx.lineTo(482, 520);
    ctx.lineTo(474, 504);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#12233d';
  ellipse(ctx, 482, 486, 7, 7);
  ctx.fillStyle = '#8a6d2b';
  ctx.fillRect(452, 520, 60, 8);

  // Scattered papers (identical in both panels).
  ctx.fillStyle = 'rgba(247,234,208,0.9)';
  for (let i = 0; i < 5; i += 1) {
    const px = range(rng, 200, 420);
    const py = range(rng, 540, 610);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(range(rng, -0.4, 0.4));
    ctx.fillRect(-14, -10, 28, 20);
    ctx.restore();
  }
}

// Draw one panel of a level: variant 0 is the original, 1 the altered copy.
// seedOffset (from ?seed=N) shifts the shared decorations identically on
// both panels, so a seeded visit is reproducible and two seeds differ.
export function drawScene(ctx, levelIndex, variant, seedOffset = 0) {
  const seed = ([101, 202, 303][levelIndex] ?? 101) + seedOffset;
  const rng = createRandom(seed);
  ctx.save();
  ctx.clearRect(0, 0, 600, 636);
  if (levelIndex === 0) drawTidepool(ctx, variant, rng);
  else if (levelIndex === 1) drawNightMarket(ctx, variant, rng);
  else drawObservatory(ctx, variant, rng);
  ctx.restore();
}
