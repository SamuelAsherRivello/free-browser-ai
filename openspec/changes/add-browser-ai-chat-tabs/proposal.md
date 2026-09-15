## Why

The existing GitHub Pages application is only a runtime shell and cannot yet host free, local AI conversations. Free Browser AI will let users compare Transformer.js and WebLLM in separate browser-resident chat tabs without authentication, API credentials, or an application backend.

## What Changes

- **BREAKING** Rename the repository, GitHub Pages project path, and Vite application directory to `free-browser-ai`, and rename user-facing application text to Free Browser AI.
- Replace the placeholder application content with a responsive, multi-tab chat workspace focused solely on comparing local browser AI runtimes; trading features remain out of scope.
- Replace per-chat Provider and model setup with top-level `Chat` and `Settings` navigation. Remove the existing marketing eyebrow and headline so that this navigation leads the workspace.
- Start Settings with no Provider Models. Its Provider Models section lets users add or remove configurations: each add flow selects a Provider and compatible model, immediately prepares it, and reports preparation progress or errors there. Failed preparation remains available with Retry and Remove actions.
- Reject an attempt to add a provider/model configuration that already exists, without changing the existing configuration. Removing a configuration closes every conversation that uses it and makes it unavailable for future conversations.
- Persist Provider Model configuration records, but after reload restore each as needing preparation rather than automatically consuming memory or GPU resources.
- Require a user to prepare at least one provider/model configuration before creating a conversation. In the Chat tab, `Add Conversation` creates a conversation tab whose required `Provider Model` dropdown lists prepared configurations by Provider and model name. If no prepared configuration exists, the submit control remains disabled.
- Start with one verified, license-compatible chat model per provider; select and document the exact model IDs and public sources through runtime validation rather than assuming provider sample defaults. The Settings catalog is designed to support additional provider/model combinations in later releases.
- Keep each chat tab's chosen provider/model configuration, messages, loading state, error state, and runtime instance separate from every other chat tab.
- Persist app-managed conversations and settings in browser local storage without authentication. Provide a clear Reset control that clears this app data and refreshes the page; externally cached model files may remain.
- Run inference entirely in the browser with no application backend, API key, or server-side conversation relay so the production build remains deployable to GitHub Pages.
- Stream generated responses in the affected tab with a Stop control. Retain partial text after a stop or failure and offer a tab-local Retry using the original prompt. Enter inserts a newline and Shift+Enter submits; label the submit control `Submit (Shift+Enter)`.
- Provide a copy-to-clipboard control for every user prompt and generated response.
- Surface browser/runtime capability, model-loading, and generation failures in the affected tab without blocking other tabs.
- Preserve the static Vite GitHub Pages build and the template's title, project-link, version, and settings corner roles through the renamed project path.

## Capabilities

### New Capabilities
- `browser-ai-chat`: Create, use, persist, reset, and close independent browser-resident chat tabs backed by a per-tab Transformer.js or WebLLM provider and model selection.

### Modified Capabilities

- None.

## Impact

- Affected project identity: repository, GitHub Pages project path, project links, build configuration, and Vite application directory change to `free-browser-ai`.
- Affected application code: `free-browser-ai/src/App.jsx`, supporting source modules, styles, browser tests, and project documentation.
- Affected UI contract: the current template shell becomes the Free Browser AI chat workspace with top-level chat and Settings navigation while retaining its four corner roles.
- New dependencies: Transformer.js and WebLLM, subject to package size, browser support, model licensing, and static-host delivery validation.
- Runtime target: modern desktop browsers served as a static GitHub Pages site; WebLLM availability depends on WebGPU support, while Transformer.js provides a separately selected provider path.
- Security and privacy: prompts, responses, settings, model downloads, and inference remain client-side; app-managed data is stored in local storage; no authentication, API credentials, or remote application service are introduced. Model artifacts are fetched from the provider-selected public model source.
- Validation: extend the existing Node source checks and add focused browser tests for prepared model configuration management, persistence, reset, streaming, retry, clipboard copying, and tab isolation; run `npm test` and `npm run build` from the repository root. During apply, time-box each command to two minutes, skip blocked nonessential browser or model-runtime checks, leave their tasks unchecked, and report exact remaining work rather than repeatedly diagnosing them.
