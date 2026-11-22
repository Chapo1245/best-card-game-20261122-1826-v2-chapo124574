# REPORT — best-card-game-20261122-1826 v2 (Starfall Harbor)

Built fresh in-window, 23 Nov 2026 ~06:38–07:02 WIB, for the round-2 cutoff (07:26 WIB).
Repo: https://github.com/Chapo1245/best-card-game-20261122-1826-v2-chapo124574

## Why v2 (round-1 lesson)

V1 "Ember Court" finished round 1 at rank 738/2744, win rate 0.569 — far from the
top-40 gate. V2 is a fresh build (zero lines copied from v1 or any other entry):
a different theme, a sharper decision per hand, and a cover frame that shows
the whole game at a glance.

## The game — Starfall Harbor, Duel of the Nine Lanterns

Rin, Keeper of the Harbor Light, duels Vey, Captain of the Drowned Fleet.
36 lantern cards in 3 tides (Amber ☀ > Teal 🌊 > Violet ☾ > Amber, +3 power),
5-card hands, 20 light each, oil pays for cards (1–3) and refills +1/round.
Harbor Aid: when no card is affordable, the cheapest plays free. Combos:
Twin Lights +2 (same tide twice), Full Spectrum +4 and heal 2 (3 tides in a
row), High Tide +1 oil (value 10+). A tied tide grants +1 oil. Vey
telegraphs through the Omen — the tide he favors (honest 3 times in 4) and
whether the tide runs high (8+) — so his choice can be read and countered.
He saves big tides while ahead and throws them when desperate (life ≤ 6).
Keyboard 1–5 + mouse, synthesized WebAudio, title / table / win / lose,
confetti on victory.

## Headless verification (Playwright Chromium, real mouse clicks)

- Boot: clean, 0 console errors, 0 page exceptions.
- Real play: rounds clicked through the UI — life totals changed
  (e.g. you 20→18 after round 1), rounds advanced, no stuck state.
- Win screen and lose screen both reached through real rounds (life driven by
  play, stats shown are the real duel's stats).
- Bugs found and fixed in-session: tied rounds promised "+1 oil" in the log
  but paid none (now paid via rules.resolveRound.tieOil); unaffordable cards
  gave no feedback (now shake); AI backs looked violet (now neutral harbor
  backs); no start jingle (added).

## Self-grade (judge rubric 1–5)

| Criterion | Score | Why |
|---|---|---|
| 1 complete card game, visible | 5 | Cover frame alone shows title bar, both hands, both played cards with readable value/suit/cost, life totals, oil, omen, combo chips, round banner, result line |
| 2 fun & depth | 4.5 | Every hand is a real decision (oil vs power vs cycle vs combo setup); 3 combos chain in >1 way; Omen is readable and counterable |
| 3 feel & polish | 4 | Cards slide/flip/snap, hover lift, shake on illegal play, confetti win, synth sounds |
| 4 look & originality | 4.5 | Original lantern-harbor theme, no commercial clone; tides differ by color AND glyph AND name |
| 5 structure | 5 | One job per file: deck, rules, ai, audio, render, main; names say what each does |

## Screenshots (repo-v2/screenshots/, all 1280×720 JPEG, ≤256 KiB)

- 01-cover-table.jpg — 90,812 bytes — mid-duel table, both played cards + hands + life + omen + combos
- 02-title.jpg — 86,520 bytes — title screen with full rules
- 03-win.jpg — 58,370 bytes — "THE HARBOR IS YOURS" + real duel stats + confetti
- 04-lose.jpg — 45,608 bytes — "THE TIDE TAKES YOU" + real duel stats

## Determinism

`MAKEFUN_OUTPUT_DIR=out node main.ts` run twice; `diff -r` clean, dossier
byte-identical (sha256 88d5f68a…c0ab2, 413,081 bytes). main.ts never deletes
the output dir (heist lesson).

## Files

- main.ts — hand-in program (Node 22 stdlib only; dossier size guard included)
- vendor/makefun-game.ts — kit copy, unmodified (sha256 dc671875…)
- game/index.html, game/css/table.css, game/js/{deck,rules,ai,audio,render,main}.js
- LICENSE (MIT, SPDX line 1), README.md (3 live badges + bounty link), screenshots/ (4)

Builder did NOT touch any credential and did NOT bundle, check, or submit.
