# Pitch Royale v56 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v55 presentation layer with the approved v56 responsive interface while preserving the stable tournament, match, career and cloud engine.

**Architecture:** Keep v55 `app.js` and `cloud.js` behavior intact. Load a new classic-script UI adapter after them that reassigns the global `render` function and extends the existing `ACT` action map; dedicated v56 CSS owns the visual system. Browser smoke tests run against a local HTTP server with Chromium.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, existing Supabase JS client, Node built-in test runner, Chromium headless.

**Spec:** `docs/superpowers/specs/2026-11-02-pitch-royale-v56-design.md`

## Global Constraints
- Do not push to GitHub or deploy to Netlify.
- Do not rewrite the v55 tournament engine or cloud backend in this pass.
- Standings show players only; temporary club badges/names are forbidden there.
- Club crests in fixtures/live/results/finals use consistent fixed-size frames.
- Player photos remain optional with initials fallback.
- Normal screens stay light/professional; cinematic dark emerald/gold is reserved for Finals/champion and selected tools.
- Preserve `pr1` localStorage state compatibility.

## Review Focus
- Existing saved v55 state containing no photo fields still renders every player correctly.
- Tournaments with champions classify as Completed while unfinished tournaments classify as Active.
- Club badge URL failure still leaves a clean framed fallback and readable club name.
- Mobile widths never clip sidebar/drawer labels, player names, fixture controls or account forms.
- Cloud/auth actions remain callable after the render override and use the new v56 modal without breaking recovery/login/local mode.

---

### Task 1: Isolated v55 Baseline and v56 Adapter Skeleton

**Files:**
- Create: `club-badges.js`
- Create: `ui-v56.js`
- Create: `styles-v56.css`
- Modify: `index.html`
- Create: `tests/ui-v56-core.test.cjs`

**Interfaces:**
- Consumes: v55 globals `S`, `V`, `N`, `ACT`, `T`, `table`, `done`, `pstats`, `allCareer`, `save`, `render`, `post`, `PRCloud`.
- Produces: `window.PRV56`, new `render()` implementation, `PRV56.clubMeta(name)`, `PRV56.tournamentStatus(t)`, `PRV56.filterTournaments(list, filter)`.

- [ ] **Step 1: Write failing helper tests**
  - `tournamentStatus` returns `completed` when `champ != null`, otherwise `active`.
  - `filterTournaments` supports `all`, `active`, `completed`.
  - `clubMeta('Real Madrid')` and `clubMeta('AC Milan')` return non-empty crest URLs and short labels.
  - unknown club returns safe fallback metadata.

- [ ] **Step 2: Run tests to verify RED**
  Run: `node --test tests/ui-v56-core.test.cjs`
  Expected: FAIL because v56 helper modules do not exist.

- [ ] **Step 3: Implement adapter skeleton and asset loading**
  - `club-badges.js` owns team metadata/fallback only.
  - `ui-v56.js` exposes pure helpers in Node and browser adapters in the browser.
  - `styles-v56.css` defines tokens, shell, sidebar/header, card, button, badge-frame and mobile primitives.
  - `index.html` loads `styles-v56.css`, then `club-badges.js`, then `ui-v56.js` after `cloud.js`.

- [ ] **Step 4: Run helper tests GREEN**
  Run: `node --test tests/ui-v56-core.test.cjs`
  Expected: PASS.

- [ ] **Step 5: Browser baseline smoke**
  Run local server and Chromium DOM/screenshot check.
  Expected: app renders v56 shell without JS error; stable empty/list state is visible.

### Task 2: Tournament Home, Filters and Tournament Workspace

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Modify: `tests/ui-v56-core.test.cjs`
- Create: `tests/browser-smoke.py`

**Interfaces:**
- Consumes: Task 1 shell/helpers and v55 actions `ACT.go`, `ACT.open`, `ACT.tab`, `ACT.mk`, `ACT.st`, `ACT.goal`, `ACT.un`, `ACT.ft`, `ACT.ed`, `ACT.se`.
- Produces: v56 tournament list, filter cards, current tournament hero, overview/fixtures/standings/statistics/title race/final views.

- [ ] **Step 1: Write RED tests for tournament rendering contracts**
  - completed filter excludes active tournaments.
  - active filter excludes completed tournaments.
  - standings HTML contains player names but no known temporary club names and no `pr-club-frame`.
  - fixture HTML contains player names, club names and `pr-club-frame`.

- [ ] **Step 2: Run tests RED**
  Run: `node --test tests/ui-v56-core.test.cjs`
  Expected: FAIL on missing render helpers.

- [ ] **Step 3: Implement tournament home and workspace**
  - All/Active/Completed cards update local UI filter state.
  - Active tournament hero shows name, player count, stage/progress and start metadata.
  - Tabs map existing v55 data to Overview, Fixtures, Standings, Statistics, Title Race, Final/History without changing engine state.
  - Fixtures retain all existing match controls via original `data-a` action names.
  - Standings remain player-only.

- [ ] **Step 4: Run tests GREEN**
  Run: `node --test tests/ui-v56-core.test.cjs`
  Expected: PASS.

- [ ] **Step 5: Browser interaction smoke**
  Use `tests/browser-smoke.py` against Chromium/CDP to seed sample state, click All/Active/Completed, open a tournament and switch tabs.
  Expected: filters and tabs update, no console exceptions, player names remain visible.

### Task 3: Players, Profile, Career & Hall of Fame

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Modify: `tests/ui-v56-core.test.cjs`
- Modify: `tests/browser-smoke.py`

**Interfaces:**
- Consumes: `S.saved`, `allCareer()`, `career40()`, `power40()`, `legacy40()`, tournament history.
- Produces: Players page, Player Profile page, optional photo actions, Career & Stats page, Hall of Fame page.

- [ ] **Step 1: Write RED tests**
  - profile renderer accepts a player with no photo and renders initials fallback.
  - photo field, when present, renders an image without making it required.
  - most-used-clubs section is the only profile area allowed to show club crests.
  - career renderer preserves current OVR/titles/form data from v55 calculations.

- [ ] **Step 2: Run tests RED**
  Run: `node --test tests/ui-v56-core.test.cjs`
  Expected: FAIL on missing profile/career render helpers.

- [ ] **Step 3: Implement player/career/HOF views**
  - Saved Players list with readable names and OVR where available.
  - Player Profile hero and sections from the approved design.
  - Add/change/remove photo UI with initials fallback; save photo on matching saved-player record for review build.
  - Career & Stats and HOF use existing v55 computed data instead of duplicating calculations.

- [ ] **Step 4: Run tests GREEN**
  Run: `node --test tests/ui-v56-core.test.cjs`
  Expected: PASS.

- [ ] **Step 5: Browser smoke for profile navigation/photo fallback**
  Expected: open player profile, no-photo fallback visible, all profile sections render without console errors.

### Task 4: Account/Cloud, Tools and Responsive Navigation

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Modify: `tests/browser-smoke.py`

**Interfaces:**
- Consumes: `PRCloud.login`, `signup`, `reset`, `local`, `logout`, `uploadNow`, `backup`; existing wheel/TV/audio actions.
- Produces: centered v56 Account & Cloud modal, desktop sidebar, mobile drawer/bottom navigation, v56 tool surfaces.

- [ ] **Step 1: Add browser RED checks**
  - account modal bounding box is centered in viewport at desktop width.
  - mobile width shows no desktop sidebar overflow and exposes mobile navigation.
  - tool labels are fully visible and not clipped.

- [ ] **Step 2: Run browser checks RED**
  Expected: fail against incomplete views.

- [ ] **Step 3: Implement v56 Account & Cloud adapter**
  - Override `ACT.account` after `cloud.js` loads.
  - Login/Create Account/Forgot Password tabs call existing `PRCloud` methods.
  - Authenticated/local status surfaces remain readable and centered.
  - Preserve password recovery path by leaving `PRCloud` recovery handling intact.

- [ ] **Step 4: Implement responsive nav and tools**
  - Desktop sidebar labels never wrap/clamp incorrectly.
  - Mobile drawer + bottom nav.
  - Penalty Wheel, Backup & Restore, Music & Audio, TV Mode use v56 surfaces while preserving existing actions.

- [ ] **Step 5: Run browser checks GREEN**
  Expected: all centering/responsive/tool checks pass with no JS errors.

### Task 5: Finals/Champion Polish, Regression Verification and Review Package

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Modify: `tests/browser-smoke.py`
- Create: `CHANGELOG_v56.txt`
- Create: `README_v56_REVIEW.txt`

**Interfaces:**
- Consumes: existing v55 Final/champion/penalty/trophy state and animation triggers.
- Produces: final review build ZIP and screenshot set; no deployment.

- [ ] **Step 1: Add RED browser assertions**
  - Final view uses gold prestige accents without changing normal-page tokens.
  - champion view contains champion name, Final result context and Lift Trophy action.
  - existing match controls still mutate seeded state correctly: start → goal → undo → full time.

- [ ] **Step 2: Implement Finals/champion visual layer**
  - Dark emerald cinematic surface, gold hierarchy, consistent crest frames, awards and trophy flow.
  - Keep v55 engine transitions and event actions authoritative.

- [ ] **Step 3: Run full automated suite**
  Run: `node --test tests/ui-v56-core.test.cjs && python tests/browser-smoke.py`
  Expected: PASS, zero console exceptions.

- [ ] **Step 4: Render visual QA screenshots**
  Capture desktop and mobile screenshots for: tournament home, fixtures, standings, profile, account/cloud, live match, Final/champion.
  Expected: no clipped labels, no club crests in standings, framed crests in match contexts, readable player names.

- [ ] **Step 5: Package review build**
  Produce a ZIP from the isolated worktree with v56 files and review notes.
  Expected: local ZIP only; no GitHub/Netlify action.
