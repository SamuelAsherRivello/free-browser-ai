## Context

The Settings screen currently selects and prepares Provider Models, while model metadata in `catalog.js` contains only identity and display details. Generation requests use fixed adapter settings: Transformers.js supplies a custom chat template and sampling parameters in its worker, while WebLLM streams a completion without request options. State persistence currently stores Provider Model records, conversation records, and the selected workspace view.

The documented runtime matrix identifies Qwen2.5 0.5B models, but the active catalog identifies SmolLM2 models. See `proposal.md` for motivation and the browser-ai-chat delta spec for user-facing requirements.

## Goals / Non-Goals

**Goals:**
- Define one catalog-owned recommended profile per supported provider/model pair.
- Make four compatible generation controls understandable and keyboard-accessible in the existing Settings visual language.
- Persist user overrides by provider/model pair without changing conversation history semantics.
- Pass one normalized effective profile to both local adapter paths for each new request.
- Restore catalog and documentation agreement using verified public model and runtime information.

**Non-Goals:**
- Adding a backend, cloud inference, model download management, arbitrary advanced sampling controls, or in-flight generation reconfiguration.
- Guaranteeing factual correctness from small local models; profiles reduce avoidable repetition but do not replace model capability.
- Sharing profiles between model families or silently applying an override from one model to another.

## Decisions

### Catalog-owned profile metadata

Extend each catalog entry with a recommended profile containing normalized values for `temperature`, `topP`, `repetitionPenalty`, and `maxNewTokens`. Use a provider/model key as the stable persistence key. Keep numeric values with the model definition so the UI, documentation, and request construction share one source of truth.

This is preferred to global defaults because the currently supported model families differ in size and behavior. It is preferred to per-conversation profiles because the settings intent is to tune the model itself, and provider/model configurations already define the selectable inference unit.

Final numbers must be based on each model's published materials and confirmed against the installed Transformers.js and WebLLM request contracts. Qwen2.5 0.5B is the intended initial catalog in the existing runtime matrix; if verification shows a published ID or browser runtime incompatibility, update both catalog and matrix together rather than leaving a mismatch.

### Effective-profile resolution

At request time, resolve `effectiveProfile` as the model's recommended profile overlaid with only that provider/model pair's saved overrides. Validate every persisted numeric value against a shared allowed range and fall back to the recommendation when it is missing, non-finite, or out of range. Pass this resolved object through `App.jsx` to `prepareAdapter`'s generated adapter, then map its normalized fields to each runtime's supported option names.

This preserves the worker boundary and avoids making storage format or React UI details part of either inference implementation. A single global profile was rejected because it would make a low-capacity model inherit unsuitable Qwen settings.

### Settings interaction

Add a distinct Generation subsection below Provider Model management. Its controls use native range inputs paired with explicit labels, current numeric output, boundaries, and concise guidance. The selected Provider and model determine the displayed profile. Restore recommended settings removes only that model's saved override, then renders the profile from catalog metadata.

Do not add a save button: each valid adjustment updates persisted preferences, and the next submission consumes them. Changes have no effect on a response that is already streaming. Native range inputs are chosen over custom slider widgets to preserve keyboard operation and assistive-technology semantics in the existing application.

### Persistence compatibility

Evolve the app-managed local-storage payload additively with a `generationProfiles` map. Restored legacy payloads use an empty map, making every model start with its recommendation. Reset continues to remove the same storage key, clearing the profiles along with conversations and Provider Models.

## Risks / Trade-offs

- [A runtime ignores or rejects a normalized option] -> Verify each adapter's supported request parameters before implementation; pass only supported parameters and surface preparation/generation errors through existing tab-local feedback.
- [A public model ID is unavailable or too large for browser use] -> Confirm source availability, runtime catalog membership, and documented browser requirements before changing the active catalog and matrix.
- [Sliders invite ineffective tuning] -> Start from model-specific recommendations, show plain-language guidance, and offer a one-action restore path.
- [Persisted malformed values break generation] -> Validate and clamp at restore and request resolution rather than trusting local storage.
- [A long response still degrades in quality] -> Set conservative model-specific response limits and document that controls mitigate, rather than eliminate, weak-model failure modes.

## Migration Plan

1. Add catalog profiles and verify the documented provider/model identities.
2. Add additive persisted preferences with legacy-state fallback.
3. Render Settings controls and route effective profiles through both adapters.
4. Add focused state, request-option, and Settings behavior tests; run the existing production test and build commands.
5. Roll back by removing the additive preferences and profile plumbing; existing saved state remains readable because legacy fields are preserved.
