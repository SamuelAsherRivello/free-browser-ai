## Context

The application is a React 19 Vite single-page app currently rooted at `react-trading-simulator-runtime-agent/`, with a production base path for GitHub Pages. This change renames the repository, GitHub Pages identity, and Vite application directory to `free-browser-ai/`. The application currently renders only the reusable four-corner template UI. See `proposal.md` for motivation and `specs/browser-ai-chat/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**
- Add a client-only workspace with top-level Chat and Settings navigation and conversation state isolated by tab.
- Provide both requested local runtime providers through Settings-managed Provider Models that conversations select only after preparation succeeds.
- Persist app-owned conversation data and settings locally, with a clear app-data reset path.
- Preserve static deployment and make Provider capability, loading progress, streamed responses, cancellation, and failure states explicit.

**Non-Goals:**
- Synchronize conversations between devices or persist data outside app-managed browser local storage.
- Provide cloud inference, authentication, API-key management, server-side prompt storage, or model fine-tuning.
- Guarantee WebLLM operation on browsers without WebGPU or guarantee performance on low-memory devices.
- Support arbitrary user-entered model identifiers in the initial release.
- Remove model files cached by public model hosts or runtime-managed browser storage when the user resets app data.

## Decisions

### Persisted Provider Models and conversation records

Represent a Provider Model as a record containing a stable ID, Provider, model, preparation status, and tab-local error. Represent a conversation as a record containing its ID, title, selected Provider Model ID, messages, lifecycle status, and tab-scoped error. Keep Provider Models, conversation tabs, active navigation, active conversation ID, and app settings in React application state, then serialize only that app-owned state to a namespaced local-storage record. Provider adapters receive only the selected conversation's message history and report preparation or generation events back to their owning record.

This makes ownership and removal explicit: deleting a Provider Model closes its dependent conversations before removing the configuration and runtime reference. A shared global chat transcript was rejected because it would conflate contexts. One application-wide active provider was rejected because it would make cross-provider comparison impossible. Storing only app-owned state avoids falsely promising that Reset deletes model caches controlled by external origins or browser runtime libraries.

### Settings-first Provider Model lifecycle

Settings begins with no Provider Models. Its add flow selects `Transformer.js` or `WebLLM`, then displays a curated catalog for that Provider and immediately prepares the selected model. The initial catalog contains one verified chat model per Provider; exact IDs, public sources, licenses, and compatibility evidence are selected during runtime validation. The catalog is application-controlled rather than a free-form model-ID field, rejects duplicate Provider/model pairs, and retains failed preparations with Retry and Remove actions.

Curated options make model/provider compatibility, download origin, and usability testable. A universal model list was rejected because model formats and browser-runtime requirements differ. Persisted records restore as needing preparation after reload rather than automatically loading all models into memory or GPU resources. Chat creation uses only ready Provider Models and presents their Provider plus model name in one required dropdown.

### Separate runtime adapters with lazy preparation

Add independent adapters for the requested Transformer.js and WebLLM packages behind a small common interface for capability checking, model preparation, streamed chat generation, cancellation, and release. Settings prepares a Provider Model immediately after it is added and reports its progress or failure there. Retain an adapter resource only while its Provider Model is ready; release its application reference when that model is removed. Route generation output, cancellation, failure, and retry state through the owning conversation; retain partial assistant text and retry the original prompt only in that conversation.

This isolates incompatible package APIs and lets the UI handle each provider consistently. Loading both runtimes at application startup was rejected due to JavaScript payload, model-download, GPU, and memory cost. A single adapter implementation was rejected because it would hide provider-specific capability and model behavior.

### Local reset and clipboard boundaries

Implement Reset as one explicit action that clears the application's namespaced local-storage record and reloads the document. The UI explains that model caches outside this record can remain. Use the browser Clipboard API to copy the exact text of each user or assistant message; expose a tab-local feedback or recoverable error when the browser denies clipboard access.

This keeps privacy and reset behavior observable without overreaching into browser storage the application does not own. A broad deletion attempt across Cache Storage or IndexedDB was rejected because it is incomplete for cross-origin model assets and can remove unrelated runtime data.

### Static-host and privacy boundary

The application bundle remains static and GitHub Pages serves only application assets. Model resources are requested by the browser from the configured public model sources; prompts and generated content are not sent to an application-controlled backend. No secrets are included in the bundle.

This meets the deployment and free-to-use constraints. Bundling models into the repository was rejected because model artifacts are too large for an initial static site and would make upgrades difficult.

### Chat and Settings workspace navigation

Render top-level Chat and Settings navigation inside the Free Browser AI workspace, with conversation tabs nested within Chat. Remove the prior marketing eyebrow and headline. Chat's prompt editor inserts a newline on Enter and submits on Shift+Enter through a control labeled `Submit (Shift+Enter)`. Retain the required corner roles: title at upper left, project link at upper right, version at lower right, and app controls including Reset in the lower-left settings corner. Place message copy controls beside each prompt and response. Update the currently brittle source-string checks into behavior-oriented tests as the template grows into the product UI.

Replacing the page structure was rejected because repository guidance explicitly preserves those reusable corner roles.

## Risks / Trade-offs

- [WebLLM needs WebGPU and substantial GPU memory] -> Detect support before model preparation, clearly mark unavailable tabs, and keep Transformer.js independently selectable.
- [Large JavaScript and model downloads can make first use slow] -> Lazy-load adapters, display model-loading status, and begin with a deliberately small curated model catalog.
- [Concurrent models can exhaust device memory] -> Keep runtime ownership tab-scoped, avoid eager parallel loading, and expose recoverable errors instead of disrupting other tabs.
- [Public model-host availability, CORS rules, and licensing can vary] -> Validate selected model sources and licenses before adding them to the curated catalog; report download failures locally.
- [Generation APIs differ in message templates and streaming behavior] -> Normalize provider adapter inputs and outputs while keeping provider-specific configuration within each adapter.
- [A stopped or failed stream can leave ambiguous state] -> Preserve partial output, retain the originating prompt, and offer a tab-local Retry action.
- [Clipboard access can be denied by browser policy] -> Report a recoverable copy failure next to the message without affecting conversations.
- [A repository and GitHub Pages rename can break static asset paths and links] -> Update the Vite base path, workflow configuration, project links, and deployment references together and validate the renamed project path before release.
- [Preparing several Provider Models can exhaust device memory] -> Require explicit Settings preparation, never prepare saved configurations automatically, and release app-held resources when a Provider Model is removed.
- [Long-running validation can stall apply] -> Time-box commands to two minutes; record blocked nonessential browser or model-runtime checks as incomplete tasks and report them instead of repeatedly retrying.

## Migration Plan

1. Rename the repository, GitHub Pages project path, Vite application directory, build configuration, project links, and deployment references to `free-browser-ai`; verify static assets resolve at the new path.
2. Install and validate the two requested browser-runtime packages and one license-compatible chat model per Provider against the renamed Vite build and GitHub Pages path before wiring the UI.
3. Replace the placeholder content with the Free Browser AI Chat and Settings workspace while retaining required template corners, app controls, Reset, and keyboard behavior.
4. Build and run focused tests locally with two-minute command limits; report deferred nonessential browser or model-runtime checks rather than blocking delivery.
5. Roll back by redeploying the prior static build if either provider prevents the application from loading; provider-specific runtime errors remain recoverable per tab after release.
