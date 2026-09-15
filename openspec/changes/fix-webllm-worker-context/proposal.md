## Why

WebLLM initialization currently fails before a model can load because its worker routes messages through an unbound handler method. Users see `WebLLM worker failed: Uncaught TypeError: this.handleTask is not a function` instead of a usable local WebLLM provider.

## What Changes

- Bind the WebLLM worker message handler to its engine-handler instance so reload and generation requests retain their required context.
- Improve worker initialization failure reporting so an affected Provider Model receives a recoverable, actionable error while other conversations remain usable.
- Verify the installed WebLLM worker contract and supported catalog IDs before initialization.
- Add focused automated coverage for worker handler binding and adapter failure cleanup.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `browser-ai-chat`: Require WebLLM Provider Models to prepare successfully when the browser and selected model meet runtime requirements, or report a recoverable provider-local initialization failure.

## Impact

- Affects `free-browser-ai/src/webllm.worker.js`, `free-browser-ai/src/adapters.js`, and WebLLM-focused automated coverage.
- Uses the existing installed `@mlc-ai/web-llm` package and browser-only worker architecture; no new dependency or backend is proposed.
