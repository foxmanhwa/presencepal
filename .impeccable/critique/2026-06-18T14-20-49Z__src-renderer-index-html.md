---
target: src/renderer/index.html
total_score: 25
p0_count: 0
p1_count: 2
p2_count: 3
timestamp: 2026-06-18T14-20-49Z
slug: src-renderer-index-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Scanning countdown excellent; 5s gap where nothing confirms it's working creates anxiety |
| 2 | Match System / Real World | 3 | Launch/Stop/Live well-chosen; Discord App ID in modal is opaque |
| 3 | User Control and Freedom | 2 | No cancel during 5-second scanning countdown; Stop only appears after setLive() |
| 4 | Consistency and Standards | 3 | Mostly cohesive; 10px vs 11px uppercase label inconsistency |
| 5 | Error Prevention | 2 | Set Discord to Online notice appears after launch not before |
| 6 | Recognition Rather Than Recall | 3 | List and actions visible; Add Custom Game exe name requires external lookup |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; game items are divs with no tabindex |
| 8 | Aesthetic and Minimalist Design | 4 | Near-monochrome with four semantic colors, nothing decorative |
| 9 | Error Recovery | 2 | Raw error strings in toasts; no recovery path suggested |
| 10 | Help and Documentation | 1 | No in-app help; Discord App ID field unexplained |
| **Total** | | **25/40** | **Acceptable** |

## Anti-Patterns Verdict

LLM: Not AI-generated. Execution specific enough to read as deliberate. One tell: dark utility + cyan accent is first-order reflex. Quality saves it, no second layer distinguishes it.

Detector: 1 finding (dark-glow, line 484). FALSE POSITIVE — launch button hover glow is a Named Rule exception in DESIGN.md.

## Priority Issues

[P1] No keyboard navigation — game items are divs, no tabindex, no Enter-to-launch, WCAG 2.1.1 failure.
[P1] No escape during scanning countdown — Stop button hidden for 5s after Launch.
[P2] Add Custom Game modal: Executable Name has no guidance, Discord App ID unexplained.
[P2] Error toasts surface raw Node.js error strings.
[P2] Set Discord to Online notice appears post-launch, not proactively.

## Persona Red Flags

Alex: Enter/arrow/slash do nothing. Stuck in countdown with no abort.
Jordan: Detecting countdown looks like crash. Add Custom Game fields unexplained.
Sam: Tabs past entire game list (all divs). Primary flow broken.
Riley: Golden path excellent via Recent section.

## Minor Observations

- #game-count dead code (display:none, count in #api-status)
- #hdr-icon-glow dead element (no .on CSS rule)
- "No games found" has no CTA
- #more-results dead code
- Custom games not persisted on restart
- Unicode star symbols may render inconsistently
