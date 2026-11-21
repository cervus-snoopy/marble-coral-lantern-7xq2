// Synthesised WebAudio sounds: no audio files, every effect is a few
// oscillators with an envelope. The context is created lazily on the first
// user gesture, so a page opened for a screenshot never needs sound.
export function createAudio() {
  return { ctx: null, muted: false };
}

function ensure(audio) {
  if (!audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio.ctx = new AC();
    } catch {
      return null;
    }
  }
  if (audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
  return audio.ctx;
}

function tone(audio, freq, startAt, duration, type = 'sine', volume = 0.16) {
  const ctx = ensure(audio);
  if (!ctx || audio.muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + startAt;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playFind(audio) {
  // A bright rising chime: E5, G5, B5, E6.
  [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => tone(audio, f, i * 0.07, 0.35));
}

export function playError(audio) {
  // A dull low buzz.
  tone(audio, 140, 0, 0.22, 'sawtooth', 0.1);
  tone(audio, 110, 0.02, 0.22, 'sawtooth', 0.08);
}

export function playHint(audio) {
  tone(audio, 880, 0, 0.18, 'triangle', 0.12);
  tone(audio, 1174.66, 0.09, 0.22, 'triangle', 0.12);
}

export function playClick(audio) {
  tone(audio, 520, 0, 0.07, 'triangle', 0.08);
}

export function playWin(audio) {
  // A little victory arpeggio: C E G C E G C.
  [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093].forEach((f, i) =>
    tone(audio, f, i * 0.09, 0.4),
  );
}

export function playLose(audio) {
  [392, 329.63, 261.63].forEach((f, i) => tone(audio, f, i * 0.16, 0.35, 'triangle', 0.12));
}
