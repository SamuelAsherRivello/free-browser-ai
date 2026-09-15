## Context

See `proposal.md` for motivation. The catalog currently owns provider model identifiers, labels, and source URLs. Settings renders those labels directly, `state.js` restores all app-managed records from `free-browser-ai.state.v2`, and WebLLM has a separate download-size lookup in `adapters.js`. The installed WebLLM prebuilt configuration includes q4f16 Qwen2.5 0.5B and 1.5B entries, with reported VRAM requirements of about 945 MiB and 1,630 MiB respectively.

## Goals / Non-Goals

**Goals:**
- Maintain the two validated Qwen2.5 options and their display metadata in one catalog entry per model.
- Display a concise tier and approximate download estimate in the native Settings dropdown.
- Invalidate existing app-managed Provider Model and conversation records exactly once when the catalog changes.
- Keep runtime preparation progress consistent with the catalog's WebLLM estimate.

**Non-Goals:**
- Downloading model files during catalog selection.
- Preserving legacy SmolLM2 configurations or conversations.
- Adding remote providers, account storage, or automatic model recommendations.

## Decisions

### Catalog-owned display and runtime metadata

Each catalog model will carry its label, source, capability tier, and approximate download size. The Settings dropdown will format that metadata, while WebLLM preparation reads the same value rather than keeping an independent identifier-to-size map. This prevents the selection UI and progress messaging from drifting. The alternative, maintaining a presentation-only size map in `App.jsx`, would duplicate provider metadata and cannot serve runtime feedback.

### Two Qwen2.5 q4f16 pairs

Transformers.js will use the public `onnx-community/Qwen2.5-0.5B-Instruct` and `onnx-community/Qwen2.5-1.5B-Instruct` repositories. WebLLM will use the installed prebuilt `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` and `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` IDs. The q4f16 variants balance local resource use and response capability. Full-precision WebLLM variants are excluded because they materially increase browser resource requirements without meeting the requested two-choice catalog.

### Versioned state invalidation

`state.js` will persist a catalog version alongside app state. Restore will return empty Provider Model and conversation collections when the stored version differs, then the next save records the current version. This removes every legacy configuration and chat together, matching the selected migration behavior. Filtering individual unsupported records was rejected because it could retain chats pointing at removed configurations.

### Curated estimates

The catalog will use stable approximate MiB values, documented in `runtime-matrix.md`. The estimates describe first-time runtime downloads rather than exact cache usage. The implementation will derive Transformers.js estimates from the selected browser-appropriate ONNX artifacts and use the verified WebLLM prebuilt resource values.

## Risks / Trade-offs

- [Published artifacts or WebLLM prebuilt values change] -> Validate all identifiers and estimates against the installed runtime and public model sources; update the catalog and runtime matrix together.
- [Catalog upgrade clears user data] -> Limit invalidation to app-managed local storage, start in the new-conversation state, and preserve browser runtime caches outside app-managed storage.
- [Approximate sizes differ from actual network usage] -> Prefix dropdown and documentation values with `approx.` and retain existing preparation progress reporting.

## Migration Plan

1. Release the catalog and storage version change together.
2. On the first subsequent restore, detect the earlier stored version and return empty Provider Model and conversation state.
3. Save the new version with subsequent state changes.
4. Rollback retains no app-managed legacy data by design; browser-cached model files remain controlled by their runtimes.
