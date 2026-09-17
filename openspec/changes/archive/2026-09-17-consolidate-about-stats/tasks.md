## 1. Update Contracts And State

- [x] 1.1 Update saved workspace-view restoration so `stats` migrates to `about`, and verify the state restoration test covers stale saved Stats state.
- [x] 1.2 Remove Stats from top-level navigation and route selection, and verify static workspace tests expect only About, Settings, and Chat navigation.

## 2. Build Compact About With Embedded Stats

- [x] 2.1 Refactor the About view into compact upper and lower regions, and verify the About rendering still includes the existing project purpose, runtimes, benefits, and drawbacks in reduced copy.
- [x] 2.2 Refactor stats presentation into an embeddable compact component that retains loading, empty, unavailable, and populated states, and verify component tests still cover each state without raw duration or cumulative total exposure.
- [x] 2.3 Embed compact response statistics in About and verify populated About output shows overall average, response count, provider, model, per-model count, per-model average, and compact privacy/caveat copy.

## 3. Responsive Styling

- [x] 3.1 Update desktop styles so About visually uses roughly the upper half for compact informational content and the lower half for compact statistics, and verify the wide workspace remains within the viewport without document-level scrolling.
- [x] 3.2 Update mobile and short-height styles for three navigation targets and embedded About statistics, and verify About, Settings, and Chat setup content remain reachable through one vertical scroll path without horizontal clipping.

## 4. Verification

- [x] 4.1 Run the focused application test suite and verify all static, state, stats, and responsive contract tests pass.
- [x] 4.2 Run the production build and verify the static GitHub Pages build still completes.
- [x] 4.3 Serve the built app and perform browser checks for desktop and mobile About, Settings, and Chat views, verifying the removed Stats page is not reachable from navigation and embedded About stats remain readable.
