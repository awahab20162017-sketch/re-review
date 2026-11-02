# Pitch Royale v57 Reference Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the current v56 review build faithfully match the approved v57 reference board while fixing the interaction defects found during Chrome review.

**Architecture:** Keep the v55 engine and current v56 adapter boundary. Extend `ui-v56.js` with v57-local UI state/actions and update `styles-v56.css` as the presentation layer; only touch `app.js` if an existing global audio value cannot be safely controlled through the adapter.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, existing classic-script globals, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-02-pitch-royale-v57-board-design.md`

## Global Constraints
- No GitHub push or Netlify deployment.
- Preserve v55 tournament, match, career, cloud and save-state behavior.
- Standings stay player-only.
- Club badges use consistent framed containers.
- Player names and primary actions must be larger/bolder than secondary metadata.
- Immersive celebration/replay surfaces hide the sidebar.
- Lift Trophy must not re-run Match Replay.

## Review Focus
- Live +/scorer controls still mutate the real match through existing actions.
- Minus cannot undo an opponent's last goal.
- Profile tabs remain usable for empty and populated career records.
- Audio slider works before and after AudioContext creation, and mute UI reflects real `MU` state.
- Existing saved players remain readable in New Tournament even when selected/unselected.

---

### Task 1: Reference-Board Visual System and Collapsible Shell

**Files:**
- Modify: `styles-v56.css`
- Modify: `ui-v56.js`
- Test: `tests/ui-v56-core.test.cjs`

**Interfaces:**
- Consumes: current `shell()` and `ui` state.
- Produces: `ui.sidebarCollapsed`, `ACT.v57collapse`, immersive shell mode classes, stronger v57 visual tokens.

- [ ] Write failing tests for collapse action hooks/classes and immersive shell class behavior.
- [ ] Run tests RED.
- [ ] Implement collapsible sidebar and automatic immersive mode for champion/replay contexts.
- [ ] Update typography/color/card/button tokens to match the board.
- [ ] Run tests GREEN.

### Task 2: Live Match Controls and Badge Alignment

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Test: `tests/ui-v56-core.test.cjs`

**Interfaces:**
- Consumes: `ACT.goal`, `ACT.un`, match `g` log, `data-ms` scorer inputs.
- Produces: per-side score pods with minus / score / plus, aligned badge/player blocks, `ACT.v57minus`.

- [ ] Write failing tests for two + buttons, two minus buttons, scorer selects/inputs, and safe side-specific undo rules.
- [ ] Run tests RED.
- [ ] Implement match layout/control changes without replacing match engine actions.
- [ ] Run tests GREEN.

### Task 3: Functional Player Profile Tabs and Tournament Setup

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Test: `tests/ui-v56-core.test.cjs`

**Interfaces:**
- Consumes: existing career/player data and `N` new-tournament state.
- Produces: `ui.profileTab`, `ACT.v57profiletab`, real tab panels, readable saved-player chips, professional assignment toggle/cards.

- [ ] Write failing tests for profile tab action hooks and tab-specific content.
- [ ] Write failing tests that saved-player chips contain visible names and club assignment controls use explicit labeled toggle/card UI.
- [ ] Run tests RED.
- [ ] Implement profile tabs and new-tournament redesign.
- [ ] Run tests GREEN.

### Task 4: Music & Audio Controls

**Files:**
- Modify: `ui-v56.js`
- Test: `tests/ui-v56-core.test.cjs`
- Modify: `styles-v56.css`

**Interfaces:**
- Consumes: global `MU`, `MG`, `AC`, `FXM`, `applyFx`, existing `ACT.mu`.
- Produces: `ACT.v57mute`, `ACT.v57volume`, `ACT.v57fx`, topbar state reflection and real audio panel controls.

- [ ] Write failing tests for mute-state classes/text, range input, persisted volume key, and direct effect-level buttons.
- [ ] Run tests RED.
- [ ] Implement adapter actions and audio panel/topbar UI.
- [ ] Run tests GREEN.

### Task 5: Champion Summary and One-Way Trophy Celebration Flow

**Files:**
- Modify: `ui-v56.js`
- Modify: `styles-v56.css`
- Test: `tests/ui-v56-core.test.cjs`

**Interfaces:**
- Consumes: champion/final state and existing `boom()` celebration.
- Produces: champion summary stats/awards, one-time lift action, separate replay action, `ui.immersive` state.

- [ ] Write failing tests that `ACT.v56lift` no longer aliases replay and champion output contains match/win/goal/win-rate stats.
- [ ] Run tests RED.
- [ ] Implement one-way Lift Trophy behavior and richer summary.
- [ ] Run tests GREEN.

### Task 6: Regression, Review Package and Handoff

**Files:**
- Modify: `README_v56_REVIEW.txt`
- Create: `CHANGELOG_v57.txt`
- Test: all existing tests

**Interfaces:**
- Consumes: Tasks 1-5.
- Produces: local v57 review ZIP only.

- [ ] Run `node --test tests/ui-v56-core.test.cjs tests/v55-engine-regression.test.cjs`.
- [ ] Run JS syntax checks.
- [ ] Self-review action hooks and state compatibility.
- [ ] Package exact clean commit as local ZIP; no push/deploy.
