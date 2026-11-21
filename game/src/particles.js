// Gold sparkle bursts that pop when a difference is found. Particles live in
// panel space and are drawn over both panels at the same spot.
export function createParticles() {
  return { list: [] };
}

export function burst(particles, x, y, count = 26) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 160;
    particles.list.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0.55 + Math.random() * 0.35,
      age: 0,
      size: 2.5 + Math.random() * 4,
      color: Math.random() < 0.7 ? '#ffd94d' : '#ffffff',
    });
  }
}

export function updateParticles(particles, dt) {
  for (const p of particles.list) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
  }
  particles.list = particles.list.filter((p) => p.age < p.life);
}

export function drawParticles(ctx, particles) {
  for (const p of particles.list) {
    const t = 1 - p.age / p.life;
    ctx.globalAlpha = Math.max(0, t);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
