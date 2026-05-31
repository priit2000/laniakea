# CLAUDE.md — project context for Claude Code

This file is read automatically by Claude Code when it opens this folder. It explains
what the project is, how it's built, and the conventions to follow so you can pick up
work immediately.

## What this is

**Build Your Cosmic Brain** — an interactive, single-page educational thought experiment.
The user picks how a galaxy-cluster-sized civilization turns its stars into computers
(number of stars, how cold the computers run, how much matter for memory, energy source,
and how long it runs), and the page shows, in real time, what that civilization becomes:
its tier ("Stellar Mind" → "Eternal Mind"), how many Earth-like civilizations it could
simulate, total lifetime computation, and a list of capabilities that unlock as the
numbers grow. It is aimed at a general, high-school-level audience.

The physics is real and deliberately kept honest: the Kardashev scale, the Landauer
limit on irreversible computation, light-speed delay across the cluster (one
"whole-cluster thought" = ~200 million years), and the dark-energy event horizon. The
numbers are order-of-magnitude, not precise predictions.

## Tech stack

- **React 18** (single function component, hooks only — `useState`, `useMemo`)
- **Vite 5** for dev server and production build
- **No other runtime dependencies** — no UI library, no router, no state manager
- All styling is **inline style objects** (a `S` object) plus one injected `<style>` tag
  for things inline styles can't do (slider thumbs, hover, focus-visible, media queries,
  `prefers-reduced-motion`). There is no CSS file and no Tailwind.

## Project layout

```
cosmic-brain/
  index.html                     # HTML shell, mounts #root
  src/
    main.jsx                     # entry point, mounts <CosmicBrainBuilder/>
    CosmicBrainBuilder.jsx       # the entire app (~725 lines): logic, JSX, styles
  vite.config.js                 # Vite + @vitejs/plugin-react, builds to dist/
  package.json                   # scripts + deps
  README.md                      # deployment instructions (Cloudflare Pages)
  CLAUDE.md                      # this file
```

Almost everything lives in `src/CosmicBrainBuilder.jsx`. It is organized top to bottom as:
1. **Physics constants** (LSUN, Boltzmann, brain ops/sec, etc.)
2. **Data arrays** — `STAR_STOPS`, `TEMP_STOPS`, `MATTER_STOPS`, `SPEND_STOPS`, `STAR_TYPES`,
   `CAPABILITIES`
3. **Formatting helpers** — `fmtBig`, `fmtDist`, `fmtYears`, `fmtCount`, `sci`, etc.
4. **`PillGroup`** — the segmented-button control used for the discrete choices
5. **`CosmicBrainBuilder`** — the main component: state, the `calc` useMemo, derived
   values, then the JSX (header → controls → hero → result cards → deep-time panel →
   capabilities → footer)
6. **`S`** — the inline style object
7. **`CSS`** — the injected stylesheet string

## Commands

```bash
npm install      # first time only
npm run dev      # local dev server (usually http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # serve the built dist/ locally to sanity-check
```

## How the model works (so edits stay physically consistent)

- **Power**: number of stars × average luminosity × the Sun's output. Only stars and the
  energy-source choice affect power. In "burn the mass reserve" mode, power is the
  convertible mass-energy spread over the chosen run time, so a *shorter* burn is a
  *brighter* burn.
- **Kardashev number**: derived from power. It barely moves (it's a log of a log), which is
  why it is intentionally demoted to a small stat, NOT the hero. Don't make it the headline.
- **Compute (ops/sec)**: power × ops-per-joule, where ops-per-joule comes from the Landauer
  limit at the chosen temperature. Colder = more ops per joule (a 10× temp drop ≈ 10× ops).
- **The hero tier** is driven by **total lifetime computation** (ops/sec × run time), which
  spans ~25 orders of magnitude, so every slider visibly moves it.
- **Capabilities** unlock based on `minStars`, `needsCold`, `needsMatter`, and `minThoughts`
  (accumulated whole-cluster thoughts = run time / 200 My). The most ambitious ones need
  deep time. The final one, "Take on entropy itself," is the `ultimate: true` capstone with
  its own teal styling and the meaning-of-life text.

## Conventions to follow

- **Numbers display as rounded powers of ten**, e.g. `10^62`, never with a mantissa like
  `2 × 10^62`. A mantissa adds false precision (these figures are order-of-magnitude only),
  and `2 × 10^30` reads as essentially the same scale as `10^30`. Use the `parts(n)` helper,
  which returns `{ exp }` via `Math.round(Math.log10(n))` — rounding (not floor) so that
  e.g. `8 × 10^61` correctly shows as `10^62`. Render as `10<sup>{x.exp}</sup>`.
- **Light theme only.** The page chrome is warm/cream; only the hero and a couple of panels
  are intentionally dark. Do not introduce a dark mode.
- **WCAG AA contrast (4.5:1 for normal text)** is a hard requirement. Any new text color
  must be checked against its background. The repo's history is full of contrast fixes —
  keep it compliant.
- **Legible font sizes**: nothing below ~12px; body text ~16px.
- **Discrete choices use `PillGroup`** (segmented buttons), not sliders. Only genuinely
  continuous inputs (the run-time control) are sliders.
- Keep accessibility intact: `radiogroup`/`radio` roles on pills, `aria-label`s on controls,
  visible focus rings, and the `prefers-reduced-motion` rule.
- After any change, run `npm run build` to confirm it still compiles before considering it done.

## Deploying

Static site → Cloudflare Pages (free). See README.md. Build command `npm run build`,
output directory `dist`. No backend, no env vars.

## Likely next tasks

- Add or rebalance capabilities in the `CAPABILITIES` array (mind the `minThoughts` spacing).
- Tune tier thresholds in the `TIERS` array.
- Adjust the toy physics constants (e.g. ops per Earth-sim, conversion efficiency) — these
  are clearly commented as approximate.
- Polish styling/responsiveness.
