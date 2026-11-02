# Pitch Royale v57 — Reference Board Design

## Intent
Make the review build visually match the approved v57 reference board: cleaner, more colorful, more premium, easier to read, and more football-specific, while preserving the v55 gameplay/state engine and the working v56 adapter architecture.

## Visual target
The supplied v57 reference board is the primary visual specification. It shows six target surfaces: Tournament Overview, Live Match / Next Fixture, Player Profile, New Tournament Setup, Music & Audio / Tools, and Final / Champion / Celebration Flow.

## Goals
- Stronger visual hierarchy: larger/bolder player names, section headings, small labels and legends.
- More color than v56: emerald gradients, subtle gold prestige accents, light green utility surfaces, stadium/football atmosphere used selectively.
- Keep normal pages professional and white/light, but reduce empty gray space and sterile feel.
- Use fixed, aligned club-badge frames; logos must never float or collide with names/scores.
- Live scoring must use obvious per-player score controls: visible score, green + button, optional scorer field, global undo, full-time.
- Add a collapsible desktop sidebar; immersive celebration/replay screens should hide it automatically.
- Player profile tabs must actually switch content and expose real statistics/history sections rather than decorative dead tabs.
- New Tournament setup must show readable saved-player chips and professional club-assignment cards/toggles.
- Music & Audio must have working mute state, working volume slider, real visual-effects level selection, and consistent top-bar state.
- Trophy flow must be one-way and non-redundant: Champion summary -> Lift Trophy one-time celebration -> return to champion summary. Match Replay is a separate action, not part of Lift Trophy.
- Champion summary must show useful tournament statistics and awards after the celebration.

## Non-goals
- No backend/schema migration.
- No replacement of the v55 tournament engine, score engine, cloud auth, Supabase state, or saved JSON model.
- No GitHub push, Netlify deploy, or production merge in this pass.
- No framework migration.

## Constraints
- Keep `app.js` gameplay logic authoritative.
- Keep `ui-v56.js` as the adapter file for compatibility; v57 can add new actions/state inside it.
- Preserve all existing `data-a` engine hooks.
- Existing saved players without photos and existing tournaments must render safely.
- Badges remain forbidden in standings.
- Standard club logos keep fallback initials if remote assets fail.

## Interaction rules
- Live score + calls existing `ACT.goal` and scorer input remains `data-ms=<match><side>`.
- Per-side minus is allowed only as a safe wrapper over existing `ACT.un` when the latest logged goal belongs to that same side; otherwise it gives feedback and changes nothing.
- Profile tabs are UI-local state and do not mutate career data.
- Sidebar collapse is UI-local state and persists only for the current browser session.
- Audio volume is stored in `localStorage` and applied to the existing master gain node when present.
- Effects controls set `FXM` directly to off/lite/full rather than only cycling blindly.
- Lift Trophy must not call the existing replay action.

## Success criteria
A user reviewing the build in Chrome should immediately recognize the supplied reference board: tighter spacing, stronger green/gold football identity, larger readable typography, aligned badges, clear match controls, functional profile tabs, professional tournament setup, and a cleaner celebration flow.
