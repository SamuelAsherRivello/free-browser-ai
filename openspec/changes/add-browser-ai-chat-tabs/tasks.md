## 1. Runtime validation and foundations

- [ ] 1.1 Rename the repository, GitHub Pages project path, Vite application directory, build configuration, project links, deployment references, and documentation references to `free-browser-ai`; verify a production build resolves static assets at the renamed project path.
- [ ] 1.2 Research and select one license-compatible, browser-validated chat model for each of Transformer.js and WebLLM, recording model IDs, public sources, browser requirements, and chat compatibility; verify each choice works with the installed package APIs and public static hosting.
- [ ] 1.3 Add the approved Transformer.js and WebLLM dependencies and verify `npm ci` and `npm run build` complete with the renamed GitHub Pages base path.
- [ ] 1.4 Create persisted Provider Model configuration and conversation state plus per-provider model catalog definitions; verify automated tests cover provider-specific model lookup, duplicate rejection, reload-as-needing-preparation behavior, reset data removal, and independent conversations.

## 2. Browser runtime adapters

- [ ] 2.1 Implement a Transformer.js adapter that checks availability, prepares a selected Provider Model from Settings, streams a response from only the selected conversation's history, and supports cancellation; verify its adapter tests cover preparation success, cancellation, and preparation failure.
- [ ] 2.2 Implement a WebLLM adapter that detects required browser capability, prepares a selected Provider Model from Settings, streams a response from only the selected conversation's history, and supports cancellation where available; verify tests cover unavailable capability, cancellation behavior, and preparation failure.
- [ ] 2.3 Connect provider adapters through one Provider Model-scoped preparation boundary and conversation-scoped generation boundary; expose Settings progress, Retry and Remove for failed preparation, release app-held resources on removal, and verify removal closes dependent conversations.

## 3. Chat workspace

- [ ] 3.1 Replace the placeholder workspace content with accessible top-level Chat and Settings navigation, removing the marketing eyebrow and headline; verify keyboard navigation reaches both views.
- [ ] 3.2 Implement the initially empty Settings Provider Models section with Provider/model selection, immediate preparation progress, duplicate errors, Retry, Remove, and reload-as-needing-preparation behavior; verify the corresponding browser flows.
- [ ] 3.3 Implement `Add Conversation`, nested conversation tabs, required selection of a ready Provider Model identified by Provider and model name, and deterministic close behavior; verify removing a Provider Model closes its dependent conversations and no-ready-model state disables submission.
- [ ] 3.4 Implement the active conversation's streamed message transcript, Enter-newline and Shift+Enter submission behavior, `Submit (Shift+Enter)` control, Stop, Retry, loading feedback, tab-local errors, and copy-to-clipboard controls; verify successful streaming, stopped and failed response recovery, keyboard behavior, copy behavior, and tab-local failure feedback.
- [ ] 3.5 Add a clear Reset control in the lower-left settings corner that clears only app-managed local-storage data and reloads the page; verify the new-conversation state returns after reset and model-cache limitations are communicated.
- [ ] 3.6 Style the workspace for narrow and wide viewports while retaining the existing upper-left title, upper-right project link, lower-right version, and lower-left settings corner roles; verify responsive layouts and keyboard focus in a time-boxed Playwright browser run.

## 4. Verification and delivery

- [ ] 4.1 Replace or extend the current template-oriented source checks with behavior-focused tests for Provider Model management, persistence, reset, streaming, Stop, Retry, Shift+Enter submission, clipboard copying, conversation isolation, and the renamed GitHub Pages base-path build; verify `npm test` passes within two minutes.
- [ ] 4.2 Run `npm run build`, serve the production output at the renamed project path, and verify the Free Browser AI workspace loads without authentication, an application backend, or API-key configuration; time-box each command to two minutes and report blocked checks without repeated retries.
- [ ] 4.3 Time-box testing to two minutes per command in a supported WebGPU browser and a browser without WebGPU, confirming WebLLM reports unavailability gracefully and Transformer.js remains independently usable; document selected models, sources, licenses, tested runtime matrix, and any deferred checks in the canonical application documentation.
