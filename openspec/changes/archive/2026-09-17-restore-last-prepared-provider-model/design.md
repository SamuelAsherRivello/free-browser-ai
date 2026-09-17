## Context

See `proposal.md` for motivation and the `browser-ai-chat` delta for required behavior. Provider Model configuration records and generation profiles already persist through `state.js`, but `saveState` deliberately strips runtime status and `restoreState` returns every configuration as `needs-preparation`. Prepared adapters live only in `App.jsx` refs and own browser workers, so a page refresh necessarily discards the initialized runtime even when the model files remain in the browser runtime cache. The application releases every other adapter when a new configuration becomes ready, leaving at most one prepared runtime.

## Goals / Non-Goals

**Goals:**
- Remember which existing configuration most recently completed preparation successfully.
- Rebuild that runtime once during startup while preserving truthful status, progress, failure, adapter release, and shared-runtime behavior.
- Keep persisted state backward compatible and prevent duplicate development-mode startup work.

**Non-Goals:**
- Persisting a live worker, WASM heap, WebGPU device, or adapter instance across navigation.
- Guaranteeing that browser-cached model files remain available or preventing the runtime from downloading missing cache entries.
- Automatically preparing multiple configurations, retrying failures, or changing model-cache ownership.
- Adding remote persistence, user identifiers, analytics fields, or dependencies.

## Decisions

### Persist one successful configuration identifier

Add an optional `lastPreparedProviderModelId` field to the existing workspace state. Update it only after `prepareAdapter` resolves and the corresponding adapter is installed as ready. This matches the existing single-prepared-adapter invariant and avoids treating an attempted, loading, failed, or merely configured model as successful.

Persisting the whole ready status was rejected because readiness describes an in-memory runtime that no longer exists after refresh. Persisting provider/model values separately was also rejected because configuration IDs already provide stable local identity and allow stale references to be rejected safely.

### Sanitize restored intent separately from runtime status

`restoreState` will accept the optional identifier only when it is a string referencing one of the restored configurations; otherwise it returns no automatic-preparation target. Every configuration still restores as `needs-preparation`. This keeps older saved state compatible and prevents malformed or removed references from making a model look ready.

`saveState` will continue stripping transient progress, errors, and runtime status while storing the sanitized identifier. Removing its matching configuration clears the application state reference before persistence. Reset already removes the complete app-managed storage object.

### Reuse the existing preparation transaction

Startup restoration will call the same preparation routine used by the card action. Consequently, automatic preparation receives the same worker creation, progress reporting, runtime arbitration, replacement/release, error mapping, and ready transition as manual preparation. The startup caller catches the routine's rejected promise because the routine already records the recoverable failed state in the card.

A separate silent preload path was rejected because it could diverge from visible progress and error behavior. Marking the configuration ready before adapter creation was rejected because conversations could submit to a nonexistent runtime.

### Schedule one startup attempt after the committed mount

The startup lifecycle will use a mount-local guard plus a cancellable deferred start. React Strict Mode invokes effect setup, cleanup, and setup again during development; deferring the attempt lets the simulated cleanup cancel its scheduled work before any worker starts, while the committed setup performs exactly one attempt. The guard also prevents re-renders or state persistence from re-triggering restoration.

The effect resolves the target from the restored startup snapshot. If it is absent or no longer valid when the deferred work runs, it does nothing. User-initiated preparation continues through the existing transaction controls rather than creating a parallel adapter path.

## Risks / Trade-offs

- [Reload now consumes memory and initialization time automatically] -> Restore only the last successful configuration, show normal progress, and retain explicit Remove and Reset controls.
- [Browser cache eviction causes another download] -> Use existing progress and failure behavior; do not claim that preparation is download-free.
- [Strict Mode starts duplicate workers] -> Defer startup work until after the simulated cleanup and guard the committed attempt.
- [A stale persisted identifier references no configuration] -> Sanitize it during restoration and perform no automatic work.
- [Automatic preparation fails repeatedly across separate reloads] -> Do not retry within a mount; retain the reference so a later reload may recover from a transient platform problem, while the failed card exposes Retry or Remove.
- [Concurrent manual action overlaps deferred startup] -> Resolve and guard the startup target once, then rely on the existing preparation transaction to abort or serialize work for that configuration without installing stale adapters.

## Migration Plan

1. Extend workspace restoration and persistence with the optional, validated configuration identifier; existing saved objects without it remain valid.
2. Update successful preparation and configuration removal to maintain the identifier.
3. Add the single deferred startup restoration path through the existing preparation routine.
4. Verify unit and real-browser lifecycle behavior, then ship without a storage-key migration because the field is additive.

Rollback removes the startup effect and stops writing the optional field. Existing saved state remains readable because unknown JSON fields are ignored by the previous restoration path.
