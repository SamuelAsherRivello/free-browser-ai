## 1. Repair Worker Initialization

- [x] 1.1 Bind the `WebWorkerMLCEngineHandler` message callback to its handler instance in `webllm.worker.js`; verify a dispatched reload request retains `handleTask` and no longer throws the reported context error.
- [x] 1.2 Validate a selected WebLLM catalog ID against `prebuiltAppConfig.model_list` before engine initialization; verify unsupported IDs fail with an actionable provider-local error.

## 2. Harden Failure Handling

- [x] 2.1 Preserve the available WebLLM worker error detail and terminate the worker through one unsuccessful-initialization cleanup path; verify worker errors, rejected engine initialization, and aborts leave no usable failed worker.
- [x] 2.2 Preserve existing WebGPU capability and required-feature checks; verify each failure remains recoverable for the selected Provider Model without changing another conversation or configuration.

## 3. Verify WebLLM Behavior

- [x] 3.1 Add focused automated coverage for bound worker registration, unsupported model rejection, and initialization failure cleanup; verify `npm test` passes.
- [ ] 3.2 Run `npm run build` and manually prepare a WebLLM catalog model in a WebGPU-capable browser; verify preparation proceeds without `this.handleTask is not a function` and worker failures display their available error detail.
