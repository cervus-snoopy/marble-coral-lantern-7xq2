[![Bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/cervus-snoopy/marble-coral-lantern-7xq2/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/cervus-snoopy/marble-coral-lantern-7xq2/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Tidepool Twins — Spot the Difference

A spot-the-difference game for the [best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) bounty on make.fun.

Two near-identical pictures sit side by side. One of them is hiding changes — click a difference on either panel to mark it with a gold ring, a chime and a burst of sparkles. Wrong clicks cost 5 seconds, hints pulse a hidden difference, and the clock never stops.

## How to play

- **Click** a difference on either panel to mark it. Each find is worth 100 points, plus a combo bonus for finds in a row without a miss.
- **Wrong click**: −5 seconds and the combo breaks.
- **H** or the Hint button: pulses one unfound difference (3 per level, 8 s cooldown).
- **P**: pause. **R**: restart the level. **N**: next level after a win. **Space / click**: start.
- Clear all differences before the timer runs out to finish the level.

## Levels

| Level | Scene | Differences | Time |
| --- | --- | --- | --- |
| 1 | Tidepool Morning | 7 | 90 s |
| 2 | Night Market | 8 | 75 s |
| 3 | Star Observatory | 10 | 60 s |

## Tech

- All art is drawn with Canvas 2D — no external assets, no images, no network.
- All sound is synthesised with WebAudio — no audio files.
- Deterministic: `?seed=N` fixes the scene decorations, so the same seed always gives the same hunt.
- Screenshot staging: `?shot=cover|title|level2|win` stages a scene and sets `window.__shotReady` when painted.

## Run it

Serve the `game/` folder with any static server and open `index.html`, or:

```sh
node serve.ts   # if present in the kit
```

## Files

- `game/index.html` — page shell, canvas, HUD, status line.
- `game/src/main.js` — boot, loop, screens, `?shot=` staging, `window.__shotReady`.
- `game/src/config.js` — constants (sizes, levels, timers, colours).
- `game/src/random.js` — seeded RNG.
- `game/src/scenes.js` — the three scenes, drawn with Canvas 2D.
- `game/src/differences.js` — difference definitions per scene.
- `game/src/state.js` — game state and rules (find, miss, hint, timer, score).
- `game/src/input.js` — mouse + keyboard handling.
- `game/src/render.js` — panels, markers, HUD, screens.
- `game/src/audio.js` — synthesised WebAudio sounds.
- `game/src/shots.js` — `?shot=` staging with deterministic states.
- `game/src/particles.js` — gold sparkle bursts on each find.
- `main.ts` — entrypoint: copies `game/` and `screenshots/` to the output dir and writes `dossier.json`.

## License

MIT — see [LICENSE](LICENSE).
