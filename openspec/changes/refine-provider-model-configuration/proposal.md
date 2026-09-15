## Why

Generation controls currently live outside individual Provider Model configurations, while model preparation begins as soon as a model is added. Users need to set model-specific generation behavior before a local runtime downloads and initializes, then manage those settings directly from the prepared model's card.

## What Changes

- Change Provider Model setup to create an unprepared configuration card instead of immediately preparing the runtime.
- Move Generation controls from the shared Settings area into the card for each Provider Model.
- Let users set or restore a model card's generation profile before selecting Prepare.
- Make Prepare start the existing download and initialization flow only after users finish configuring that card.
- Replace card actions after successful preparation with Update Settings and Remove; Update Settings exposes that ready card's generation controls again without re-preparing it.
- Preserve Retry and Remove behavior for failed preparation and retain per-provider/model generation preferences across reloads.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `browser-ai-chat`: Change Provider Model preparation lifecycle and make model-specific generation configuration a card-level interaction.

## Impact

- Affected UI: `free-browser-ai/src/App.jsx` and `style.css`.
- Affected state: Provider Model configuration lifecycle and persisted generation profiles in `state.js`.
- Affected behavior: models are not downloadable or selectable for conversations until the user explicitly selects Prepare.
- Existing local inference adapters and model profile definitions remain the execution boundary; no backend or dependency is added.

## Acceptance Criteria

- Adding a model creates a card that exposes its generation controls before preparation begins.
- Selecting Prepare begins download/initialization and reports progress on only that card.
- A ready card shows Update Settings and Remove; Update Settings allows settings changes without starting preparation.
- A card's generation values remain isolated from every other Provider Model.
- Failed cards retain Retry and Remove actions.
