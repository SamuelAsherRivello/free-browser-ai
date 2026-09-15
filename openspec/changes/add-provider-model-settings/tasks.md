## 1. Verify Model Profiles

- [x] 1.1 Verify the published Transformers.js and WebLLM identifiers, browser requirements, and supported sampling parameters for the Qwen2.5 0.5B catalog; verify every source and parameter is documented in `free-browser-ai/documentation/runtime-matrix.md`.
- [x] 1.2 Define catalog-owned recommended profiles for each supported provider/model pair, including Temperature, Top P, Repetition Penalty, and Response Length; verify profile values satisfy shared allowed ranges and the catalog matches the runtime matrix.

## 2. Persist And Resolve Settings

- [x] 2.1 Extend app state persistence with model-keyed generation overrides while retaining legacy saved Provider Models and conversations; verify restore uses recommendations when overrides are absent or invalid.
- [x] 2.2 Implement effective-profile resolution that overlays a model's valid saved overrides onto its recommendation; verify one provider/model pair cannot alter another pair's resolved settings.

## 3. Apply Runtime Options

- [x] 3.1 Pass the resolved generation profile from the active conversation through the adapter boundary to Transformers.js; verify the worker receives the mapped supported options for a generation request.
- [x] 3.2 Pass the resolved generation profile through the WebLLM completion request using its supported option names; verify streamed generation retains existing cancellation and error behavior.

## 4. Build Generation Settings UI

- [x] 4.1 Add a Settings Generation section for the selected Provider Model with native range controls for Temperature, Top P, Repetition Penalty, and Response Length; verify each control exposes its label, current value, range, and plain-language guidance to keyboard and assistive-technology users.
- [x] 4.2 Display each model's recommendation and persist valid changes as that model's overrides; verify selecting another model shows only its recommendation or its own saved overrides.
- [x] 4.3 Add Restore recommended settings for the selected model; verify it clears only that model's overrides and the next response uses the restored profile.

## 5. Validate Behavior

- [ ] 5.1 Add focused automated coverage for catalog/documentation agreement, profile resolution, legacy persistence, UI control semantics, restore behavior, and adapter option mapping; verify `npm test` passes.
- [ ] 5.2 Run `npm run build` and inspect the Settings UI at desktop and narrow viewport widths; verify sliders remain usable and existing Provider Model management and conversation behavior remain intact.
