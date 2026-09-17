## 1. Persisted restoration intent

- [x] 1.1 Add state tests for saving the last successful Provider Model identifier, restoring it only when it references an existing configuration, and remaining backward compatible when the field is absent; verify the focused state tests fail before implementation and pass afterward.
- [x] 1.2 Extend `restoreState` and `saveState` with the sanitized optional `lastPreparedProviderModelId` while continuing to restore every runtime status as `needs-preparation`; verify `node --test free-browser-ai/test/page.test.mjs` passes.

## 2. Provider Model lifecycle

- [x] 2.1 Add application lifecycle coverage proving that successful manual preparation replaces the remembered identifier and removing that configuration clears it; verify the focused page tests pass.
- [x] 2.2 Update the preparation-success and removal flows to maintain the remembered identifier without changing failed, loading, or unprepared configurations; verify the lifecycle tests and existing Provider Model removal tests pass.
- [x] 2.3 Add real-browser coverage with the fake runtime proving a restored remembered configuration automatically prepares, reports progress, becomes ready, and starts only once under React Strict Mode; verify `npm.cmd run test:responsive` passes in Chromium and WebKit.
- [x] 2.4 Implement the cancellable, guarded startup restoration through the existing preparation transaction and handle its rejected promise without an automatic retry; verify the new automatic-preparation browser test passes.
- [x] 2.5 Cover absent, stale, unsupported, and failed automatic-preparation targets, confirming they never appear ready or enter a retry loop; verify the focused unit and browser regression tests pass.

## 3. Full verification

- [x] 3.1 Run `npm.cmd test` and verify the complete unit suite passes without changing unrelated workspace behavior.
- [x] 3.2 Run `npm.cmd run test:responsive` and verify all supported browser projects pass without duplicate preparation or conversation regressions.
- [x] 3.3 Run `npm.cmd run build`, `openspec validate restore-last-prepared-provider-model --strict`, and `git diff --check`; verify the production build, strict change validation, and whitespace checks all succeed.
