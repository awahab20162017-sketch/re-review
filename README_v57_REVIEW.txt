PITCH ROYALE v57 — REFERENCE-BOARD LOCAL REVIEW

IMPORTANT
This is a local review build only. It has NOT been pushed to GitHub and has NOT been deployed to Netlify.

VISUAL TARGET
REFERENCE_v57.png is the visual source of truth for this pass. v57 deliberately moves away from the pale v56 look toward the richer emerald / gold, bolder, cleaner football product shown on that board.

HOW TO REVIEW
1. Extract the ZIP to a normal folder.
2. Open index.html in Google Chrome.
3. Use your existing local data/account if you want; the stable v55 state format and engine remain underneath the new UI.
4. Keep REFERENCE_v57.png open beside Chrome and compare the six key surfaces below.

CHECK THESE SIX FIRST
1. Tournament Overview
   - richer green headers and cards
   - larger/bolder legends and table text
   - standings + upcoming fixture split layout
   - no club badges in standings

2. Live Match
   - aligned club badge frames
   - player names larger than club names
   - clear per-side minus / score / plus controls
   - optional scorer field under each side
   - Undo Last Goal and Full Time remain available

3. Player Profile
   - real v55 career stats are now bridged into v57 (matches, wins, goals, OVR, titles, form)
   - Overview / Statistics / Rating History / Achievements / Trophy Cabinet / Rivalries tabs are clickable
   - optional photo upload/change/remove with initials fallback

4. New Tournament
   - saved player names are high-contrast readable chips
   - club assignment controls are custom switches/cards rather than the giant browser checkbox
   - full built-in club pool remains selectable after deselection

5. Music & Audio
   - mute button reflects the real soundtrack state
   - top-bar and Music & Audio volume sliders control the actual Pitch Royale Theme
   - effects intensity is directly selectable: Off / Low / Medium / High / Full

6. Final / Champion / Celebration
   - richer dark emerald + gold presentation
   - Lift Trophy is a one-time trophy celebration only
   - Match Replay is a separate action and no longer loops back into Lift Trophy
   - sidebar/top chrome can collapse and immersive overlays hide it completely

CLUB BADGES
Fixtures, live matches, Finals and relevant profile history use real club crest/flag URLs inside consistent badge frames.
Standings intentionally stay player-only.
If a remote crest is unavailable, the same frame falls back to a readable abbreviation.

QA STATUS
- v57 UI tests: 46/46 passing
- original v55 engine regression: 1/1 passing (start → goal → undo → full time)
- JavaScript syntax checks: passing
- v57 action-hook audit: 55 emitted hooks, 0 missing handlers
- Chromium automation: unavailable in this sandbox, so browser-smoke records SKIP and runs structural fallback checks instead

Your local Chrome review is therefore the final visual gate. Do not deploy until you approve it.
