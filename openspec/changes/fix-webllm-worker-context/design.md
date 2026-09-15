## Context

See `proposal.md` for motivation. `webllm.worker.js` creates a `WebWorkerMLCEngineHandler` then assigns its instance method directly to `self.onmessage`. In the installed WebLLM 0.2.85 implementation, `onmessage` calls `this.handleTask`; browser event dispatch therefore supplies the worker global as `this` and fails before model reload. The adapter already checks WebGPU capability, dynamically imports WebLLM, races initialization against worker errors, and terminates the worker in its failure path.

## Goals / Non-Goals

**Goals:**
- Preserve the handler instance context for every incoming WebLLM worker request.
- Fail fast for a catalog model absent from the installed prebuilt configuration.
- Return the actual worker failure to the Provider Model while ensuring the worker is terminated exactly once on unsuccessful initialization.
- Cover the message-handler registration and adapter failure paths without requiring a real model download in automated tests.

**Non-Goals:**
- Change model selection, download estimates, generation profiles, or browser WebGPU requirements.
- Retry model downloads automatically or persist failed worker diagnostics.
- Upgrade WebLLM or introduce a backend runtime.

## Decisions

### Bind the handler at worker registration

The worker will register a function bound to its `WebWorkerMLCEngineHandler` instance. This preserves the package-defined handler's expected `this` context while keeping the package responsible for its own protocol. Reimplementing the message protocol is rejected because it would duplicate unstable third-party behavior.

### Validate the model before engine creation

The adapter will reject a WebLLM catalog ID absent from `prebuiltAppConfig.model_list` before starting the engine. This produces an explicit compatibility error rather than allowing an opaque initialization failure. The existing feature validation remains after the model lookup.

### Single owner for initialization cleanup

The adapter's initialization race will retain a single cleanup path that terminates the worker for worker errors, rejected initialization, and aborts. Worker events will include their available message or error data in the surfaced error. Successful engines retain ownership of their worker until release.

## Risks / Trade-offs

- [A future WebLLM release changes the worker API] -> Keep the worker bridge minimal and test the bound registration against the installed package contract.
- [Worker events omit useful diagnostics] -> Preserve available event message data and provide a stable fallback error without exposing stack traces as application state.
- [A model is removed from the installed prebuilt configuration] -> Reject it before creation and retain the existing recoverable Provider Model failure state.

## Migration Plan

No persisted-data migration is required. The change applies when a WebLLM Provider Model is next prepared; existing failed configurations remain available for retry.
