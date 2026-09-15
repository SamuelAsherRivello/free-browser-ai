## Context

Settings currently selects a provider/model combination, creates a configuration, and immediately starts its preparation. Generation preferences are keyed by provider/model and rendered once outside the configuration card list. Provider Model cards already track loading, ready, failed, and needs-preparation states and own their Prepare and Remove actions.

See `proposal.md` for motivation and the browser-ai-chat delta spec for behavior.

## Goals / Non-Goals

**Goals:**
- Make preparation an explicit, card-local action after initial generation configuration.
- Keep each Provider Model's generation controls and actions in a single card.
- Preserve the existing preparation progress, failure recovery, adapter release, and conversation-availability boundaries.

**Non-Goals:**
- Separating model download from runtime initialization.
- Changing inference adapters, model catalog values, persistence key shape, or conversation tab behavior.
- Adding bulk configuration or applying settings to every model at once.

## Decisions

### Explicit unprepared state

New configurations will be created as `needs-preparation` rather than `loading`. The Add action will not call the preparation routine. Selecting Prepare remains the sole transition that starts runtime work and changes the card to `loading`, retaining current progress and retry mechanics.

This avoids inventing a download-only runtime state, which neither adapter presently exposes. It also ensures the user can tune values before any model data is requested.

### Card-local editing state

Generation controls will move into a reusable card section. Unprepared and failed cards expose the section directly. Ready cards display a compact summary plus Update Settings; a card-local editing flag reveals controls only for the selected ready card. Saving is immediate through the existing persisted profile mechanism, so Update Settings is an affordance for entering edit mode, not a separate persistence transaction.

An expanded global Generation section was rejected because it obscures which configured model receives an override.

### Configuration identity and profile isolation

Keep provider/model-keyed storage and effective-profile resolution. The UI will route each card's provider and model identity to the existing update and restore operations. This preserves compatibility with the current profile data and does not require duplicating profile values onto configuration records.

## Risks / Trade-offs

- [A user expects Add to start downloading] -> Label the new card action Prepare and show its generation controls before it.
- [Several cards have settings visible at once] -> Limit ready-card editing to one card at a time; unprepared cards remain directly configurable because no runtime work is active.
- [A profile change occurs while a response streams] -> Keep the existing next-request-only behavior; do not modify an in-flight request.
- [A failed configuration is mistaken for editable readiness] -> Preserve explicit failed status and Retry action alongside its settings and Remove action.

## Migration Plan

1. Change newly added configuration records to the unprepared state.
2. Move generation controls into Provider Model cards and add ready-card edit state.
3. Update card action labels and state transitions while retaining existing failure and removal behavior.
4. Add focused lifecycle and card-isolation tests, then run the production test and build commands.
