## Why

Users currently have one unlabelled download choice per provider, which makes it difficult to balance browser resource use against response quality. Each provider needs a clearly identified lightweight and powerful local Qwen2.5 option, with an up-front download estimate.

## What Changes

- Replace the current catalog with two Qwen2.5 Instruct models per provider: 0.5B as the lightweight option and 1.5B as the powerful option.
- Show a curated approximate download size in every Settings model-dropdown option.
- Maintain the model identifiers, sources, approximate download sizes, and capability tier in the shared catalog.
- Clear app-managed saved Provider Model configurations and conversations when the catalog version changes, rather than retaining incompatible legacy configurations or chats.
- Document the validated provider/model pairs, download estimates, and browser requirements in the runtime matrix.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `browser-ai-chat`: Expand the Provider Model catalog, expose download estimates in Settings, and reset incompatible saved configurations and conversations after a catalog upgrade.

## Impact

- Affects `free-browser-ai/src/catalog.js`, persisted-state migration in `free-browser-ai/src/state.js`, Settings model selection in `free-browser-ai/src/App.jsx`, WebLLM download feedback in `free-browser-ai/src/adapters.js`, and `free-browser-ai/documentation/runtime-matrix.md`.
- Changes app-managed persistence behavior: existing Provider Models and conversations are intentionally removed at the catalog upgrade.
- Uses the installed Transformers.js and WebLLM runtime packages; no new runtime dependency is proposed.
