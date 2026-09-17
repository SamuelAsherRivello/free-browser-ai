## Why

Refreshing the page currently restores configured Provider Models as unprepared even when one had prepared successfully moments earlier. Because a browser refresh necessarily destroys the in-memory worker and WASM/WebGPU runtime, the application should remember the last successful configuration and automatically rebuild that runtime from browser-cached model assets instead of requiring another manual Prepare action.

## What Changes

- Persist the identifier of the most recently and successfully prepared Provider Model in the existing app-managed local workspace state.
- After a reload, restore every configuration conservatively as needing preparation, then automatically prepare only the remembered successful configuration.
- Show the existing preparation progress and expose the configuration to conversations only after runtime initialization succeeds.
- Replace the remembered configuration when another model prepares successfully, and clear the reference when that configuration is removed or the workspace is reset.
- Leave configurations that were never prepared, were last known to have failed, or no longer exist untouched; an automatic preparation failure remains recoverable through the existing Retry action and MUST NOT enter a retry loop.
- Make startup preparation idempotent so React Strict Mode and overlapping lifecycle work cannot create duplicate runtime preparations.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `browser-ai-chat`: Change Provider Model reload recovery from always requiring manual preparation to safely auto-preparing the last successfully prepared configuration.

## Impact

- Affected state: `free-browser-ai/src/state.js` adds a backward-compatible local reference to the last successfully prepared configuration.
- Affected lifecycle and UI: `free-browser-ai/src/App.jsx` restores that configuration through the existing preparation path and continues to report progress or failure in its card.
- Affected tests: state restoration and browser lifecycle coverage will verify successful automatic restoration, missing or removed references, failure handling, and single-start behavior.
- Existing model caches, adapters, local-only inference, conversation data, analytics privacy boundaries, dependencies, and backend behavior remain unchanged.

## Acceptance Criteria

- Reloading after a Provider Model prepared successfully automatically starts preparation for that same configuration and makes it ready only after initialization succeeds.
- Preparing a different Provider Model successfully makes it the sole configuration selected for automatic preparation on the next reload.
- Reloading with no remembered successful configuration performs no automatic preparation.
- A stale, removed, unsupported, or failed remembered configuration does not make any configuration appear ready and does not cause repeated preparation attempts.
- Automatic startup preparation uses the same progress, error, release, and shared-runtime safeguards as manual preparation and starts at most once per application mount.
