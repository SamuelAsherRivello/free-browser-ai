## 1. Validate Catalog Sources

- [ ] 1.1 Verify the Transformers.js Qwen2.5 0.5B and 1.5B ONNX repositories, selected browser artifacts, and their approximate download estimates; verify the installed WebLLM prebuilt q4f16 IDs and resource estimates for both sizes.
- [ ] 1.2 Update `free-browser-ai/documentation/runtime-matrix.md` with all four provider/model pairs, approximate download estimates, sources, licenses, and browser requirements; verify each catalog entry has matching documentation.

## 2. Implement Catalog And Persistence

- [ ] 2.1 Replace the catalog with exactly the lightweight Qwen2.5 0.5B and powerful Qwen2.5 1.5B entries for Transformers.js and WebLLM, including tier and approximate download metadata; verify catalog tests resolve all four identifiers.
- [ ] 2.2 Make WebLLM preparation progress read the catalog-owned estimate instead of an adapter-local size map; verify progress identifies the selected model's approximate download size.
- [ ] 2.3 Version app-managed saved state and clear stored Provider Models, conversations, and active selection when restoring an earlier catalog version; verify a legacy saved state returns the new-conversation state while current-version state still restores as needing preparation.

## 3. Present Model Choices

- [ ] 3.1 Format every Settings model-dropdown option with its Qwen2.5 size, lightweight or powerful tier, and approximate download estimate; verify switching providers exposes exactly two options with those details.
- [ ] 3.2 Preserve duplicate prevention, preparation, removal, and ready-model conversation behavior for all four catalog entries; verify focused state and rendered UI coverage passes.

## 4. Verify Delivery

- [ ] 4.1 Add or update automated coverage for the four-entry catalog, dropdown labels, WebLLM size lookup, state-version invalidation, and current-version restore behavior; verify `npm test` passes.
- [ ] 4.2 Run `npm run build` and inspect Settings at desktop and narrow viewport widths; verify the full model labels and download estimates remain readable and selectable.
