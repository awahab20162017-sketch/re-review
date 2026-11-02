# Pitch Royale v56 — Approved Redesign Design

## Intent
Rebuild the Pitch Royale presentation as a professional football tournament management platform while preserving the stable v55 tournament engine, match flow, career calculations, cloud save behavior, and special-event logic.

## Goals
- Match the approved v56 visual direction: off-white canvas, white surfaces, navy text, emerald identity, restrained shadows, gold reserved for prestige moments.
- Keep player names dominant and readable.
- Show club identity only where temporary club assignments matter: fixtures, live matches, results, Final, TV mode, most-used-clubs profile areas.
- Keep standings player-only: no club names or club badges.
- Add working All / Active / Completed tournament filters.
- Add a full Saved Players and Player Profile experience with optional profile photos and initials fallback.
- Preserve all v55 gameplay and state behavior including live goals, undo, full time, score editing, penalties, balancing, Finals, HOF, career stats, Penalty Wheel, TV Mode, backup/restore, account/cloud actions, audio, achievements, storylines and trophy flow.
- Desktop: 240–250px left sidebar, compact utility header, wide content area.
- Mobile: drawer/bottom navigation, readable cards/tables, no clipped labels.
- Finals/champion may be cinematic dark emerald/gold; ordinary screens remain calm and professional.

## Non-goals
- No Draft Night.
- No season system.
- No production deployment in this work.
- No GitHub push or Netlify deployment without explicit approval.
- No migration to a new framework for the production app during this pass.

## Anti-goals
- Do not reskin the old DOM with a CSS patch.
- Do not use floating/raw club logos with inconsistent sizes.
- Do not put club badges in standings.
- Do not let old Broadcast Night/game-menu styling leak into v56.
- Do not make profile photos mandatory.
- Do not break existing localStorage or Supabase state JSON.

## Constraints
- Stable base: v55 modular static app.
- Preserve `app.js` data model/action engine and `cloud.js` Supabase integration wherever possible.
- Existing event system uses `data-a` actions via mutable `ACT` object.
- Existing state is global classic-script state (`S`, `V`, `N`, `ACT`, helpers).
- New UI must work without build tooling.
- Real club crests may be loaded from public URLs for the review build; every crest must sit in a consistent framed container.
- Profile-photo review behavior may store a data URL in the saved-player record; production storage can later migrate to Supabase Storage.

## Approaches considered
### A. Rewrite v55 into React
Highest long-term cleanliness, but highest regression risk and duplicates working tournament/cloud logic. Rejected for this pass.

### B. Replace old renderer with a new vanilla v56 UI adapter while preserving v55 engine
Selected. Add `ui-v56.js` after existing scripts, replace the global `render` binding, extend `ACT` with new UI actions, and add a dedicated `styles-v56.css`. Existing gameplay actions keep calling `render()` and therefore automatically use the new renderer.

### C. CSS-only restyle of existing DOM
Fastest but already failed twice because old component structure and semantics fight the approved design. Rejected.

## Selected architecture
- Keep `app.js` as the engine/state/action source.
- Keep `cloud.js` as auth/cloud source.
- Add `club-badges.js` for badge metadata and deterministic framed rendering.
- Add `ui-v56.js` for shell, page renderers, tournament filters, player/profile views, v56 account modal, mobile navigation and adapter actions.
- Add `styles-v56.css` for the new design system and responsive layouts.
- Modify `index.html` only to load the v56 assets after v55/cloud scripts, then call the new renderer.
- Add lightweight Node tests for pure v56 helpers and browser smoke/visual checks using local Chromium.

## Visual rules
- Main emerald: approximately #0AA55C / #087A4C range; deep emerald #063D2E for hero/special surfaces.
- Main text: deep navy near #0D1733.
- Canvas: #F7FAF9 / warm off-white.
- Cards: white with 1px neutral borders and soft shadows.
- Crest frame: fixed square/rounded container, neutral/soft-green background, consistent padding, contained image proportions.
- Player name must visually outrank club name.
- Gold appears in Final/champion/trophy/HOF prestige contexts, not normal navigation/cards.

## Functional preservation
The following v55 actions remain authoritative: tournament creation and balancing, start match, goal, undo, full time, score edit, penalty winner/shootout, saved players, rotating teams, final qualification, championship state, career calculations, HOF, records, storylines, audio, TV mode, wheel, backup/restore and cloud save/auth actions.
