## Context

See `proposal.md` for motivation. The current React/Vite app renders About, Settings, Chat, and Stats from `App.jsx`, restores the selected view from app-managed local storage in `state.js`, fetches aggregate timing data through `stats-view.js`, and keeps the wide viewport inside a fixed-height workspace. Current tests assert four navigation targets and a standalone Stats rendering contract, so the implementation must update both behavior and checks together.

## Goals / Non-Goals

**Goals:**

- Keep the About content recognizable while reducing text wrapping, vertical margins, and unused panel space.
- Place compact response statistics in the About panel without changing metric collection, validation, RPCs, or aggregate data shape.
- Remove the standalone Stats route from navigation, routing, state restoration, and responsive expectations.
- Preserve the existing local-first inference behavior, privacy boundary, and static GitHub Pages deployment.

**Non-Goals:**

- No analytics schema, Supabase policy, RPC, or submitted telemetry field changes.
- No new charting, ranking, filtering, or benchmarking claims.
- No change to Settings, Chat, Provider Model preparation, or generation controls beyond navigation layout effects.

## Decisions

### Embed Stats As A Compact About Subsection

The About view will own the page composition and render the stats component in its lower region. This keeps the user's requested 50/50 visual split explicit and avoids leaving a hidden route around after removing the navigation target.

Alternative considered: keep Stats as a hidden route and merely remove the button. That would preserve stale saved state complexity and could strand returning users on a page they can no longer intentionally reach.

### Refactor Stats Content For Reuse, Not Collection

`stats-view.js` should keep fetching and formatting aggregate data, but its presentational output should support compact embedding. The populated state should reduce the existing summary and provider/model table to dense, scan-friendly lines while preserving accessible labels and the required fields.

Alternative considered: duplicate the stats fetch in About. That would couple About to metrics details and make loading/error state drift more likely.

### Migrate Stored Stats View To About

State restoration should treat saved `view: "stats"` as `about`. This gives returning users the closest equivalent content after the standalone page is removed.

Alternative considered: default stale Stats state to Chat. Chat is the first-visit default, but About is the migrated location of the user's previous content.

### Use Three Navigation Targets Everywhere

Desktop and mobile navigation styles and tests should use three equal top-level targets. The lower-left settings corner remains a required corner role but is not a replacement for the top-level Settings tab.

Alternative considered: keep a disabled Stats tab or secondary link. That adds clutter and conflicts with the goal of removing the Stats page.

## Risks / Trade-offs

- Compact text may become too terse to communicate privacy clearly -> Preserve the required collected/excluded fields in visible About copy and verify rendered text.
- Dense provider/model rows can overflow on mobile -> Use wrapping or responsive row summaries rather than a minimum-width table that creates horizontal scrolling.
- Fetching stats from About may make About appear busier or show an unavailable analytics message more often -> Keep unavailable/empty states short and visually subordinate to the About content.
- Existing string-based tests are brittle around nav count and Stats text -> Update tests to assert behavior and required visible copy for the new About composition.

## Migration Plan

1. Update state restoration so stale saved `stats` views open About.
2. Remove the Stats top-level route and navigation target.
3. Embed compact stats in About and adjust styles for the approximate 50/50 panel split.
4. Update unit/static tests and responsive checks for three navigation targets and embedded statistics.
5. Run the focused test suite and production build, then perform browser viewport verification before implementation is considered ready.

Rollback is local and non-destructive: reintroduce the Stats nav/route and restore the prior Stats presentation while keeping the unchanged analytics backend intact.
