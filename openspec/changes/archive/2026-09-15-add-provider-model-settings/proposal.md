## Why

The current small local models can produce repetitive or incoherent responses, and users have no way to adjust generation behavior. The runtime matrix documents Qwen2.5 0.5B Instruct models, while the active catalog instead selects smaller SmolLM2 models, creating a quality and documentation mismatch.

## What Changes

- Restore the documented Qwen2.5 0.5B Instruct model catalog for Transformers.js and WebLLM.
- Add a Generation section to Settings with Temperature, Top P, Repetition Penalty, and Response Length controls.
- Supply evidence-based recommended generation profiles for every catalog model, including model-specific defaults for any supported SmolLM2 model.
- Persist user overrides independently for each provider/model pair and make Restore recommended settings return to that model's profile.
- Apply the selected model profile or override to the next generation request across both local runtime adapters.
- Update runtime documentation and focused tests to describe supported controls, recommended values, and runtime parameter mapping.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `browser-ai-chat`: Add model-specific generation controls and documented catalog behavior to Provider Model setup and browser-only inference.

## Impact

- Affected source: `free-browser-ai/src/catalog.js`, `state.js`, `App.jsx`, and both runtime adapters/workers.
- Affected UI: Settings gains accessible generation sliders and a restore action.
- Affected persistence: browser local-storage state gains model-keyed generation preferences while retaining existing conversation and Provider Model records.
- Affected documentation: `free-browser-ai/documentation/runtime-matrix.md` records verified model sources and recommended generation profiles.
- No backend, API key, or server is introduced.

## Acceptance Criteria

- Users can select and understand four generation controls without requiring prior model-tuning knowledge.
- Each catalog model has a verified recommended profile; Restore returns the selected model to that profile.
- A user override for one model does not affect a different provider/model configuration.
- Both local runtime paths receive the effective supported generation settings for the next response.
- The documented Qwen catalog and the selectable catalog agree.

## Unresolved Decisions

- Verify each recommended profile against the selected model's published guidance and the installed Transformers.js and WebLLM parameter contracts before fixing final numeric defaults.
