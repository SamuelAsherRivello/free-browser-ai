## Why

The About content is useful, but the current standalone Stats page makes the top-level workspace feel wider than the amount of content justifies. Consolidating compact response statistics into the About page uses the existing panel height more efficiently while keeping the privacy boundary visible where visitors learn what the app does.

## What Changes

- Change About into a vertically balanced informational panel where the existing product/runtime content occupies roughly the upper half of the panel.
- Reduce multiline About copy and spacing so the current message remains readable with less empty space.
- Move anonymous response statistics into the lower half of About.
- Heavily compact the statistics presentation to the fewest useful lines while retaining loading, empty, unavailable, and populated states.
- Remove the top-level Stats page and Stats navigation target.
- Restore any saved `stats` workspace view to a supported remaining view instead of preserving an inaccessible tab.
- **BREAKING**: Users can no longer open response statistics from a dedicated top-level Stats tab; they now review them from About.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `browser-ai-chat`: The static workspace navigation changes from About, Settings, Chat, and Stats to About, Settings, and Chat, and mobile reachability applies to About with embedded statistics instead of a separate Stats page.
- `anonymous-response-stats`: Public aggregate response statistics are presented inside About instead of a top-level Stats view, with a compact disclosure and summary/table presentation.

## Impact

- `free-browser-ai/src/App.jsx`: About composition, top-level navigation, view routing, and any Stats embedding.
- `free-browser-ai/src/stats-view.js`: Stats content may become a compact embeddable component rather than a standalone page.
- `free-browser-ai/src/state.js`: Saved view restoration must stop accepting `stats`.
- `free-browser-ai/src/style.css`: About split layout, compact informational text, compact stats presentation, and three-target mobile navigation.
- `free-browser-ai/test/page.test.mjs` and browser checks: Update static rendering, navigation, persistence, and responsive expectations.
- No new runtime dependencies, backend tables, RPCs, or telemetry fields are introduced.
