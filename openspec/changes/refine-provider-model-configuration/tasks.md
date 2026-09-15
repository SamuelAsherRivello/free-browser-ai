## 1. Provider Model Lifecycle

- [x] 1.1 Change newly added Provider Models to the unprepared state and remove automatic preparation from the Add action; verify adding a model creates a card without starting runtime download or initialization.
- [x] 1.2 Keep Prepare as the explicit transition from unprepared to loading and preserve its card-local progress, failure, Retry, and Remove behavior; verify only the selected card enters loading.
- [x] 1.3 Update ready Provider Model actions to Update Settings and Remove; verify Update Settings does not call preparation and Remove retains its conversation cleanup behavior.

## 2. Card-Level Settings

- [x] 2.1 Move the Generation controls and recommended-profile display into each unprepared and failed Provider Model card; verify all four accessible controls operate on that card's provider/model profile.
- [x] 2.2 Add ready-card summary and edit-state behavior so generation controls remain hidden until Update Settings is selected; verify changing settings does not start a new preparation.
- [x] 2.3 Retain per-provider/model profile persistence and restore behavior from the card; verify one card's update cannot alter another card's effective profile after reload.

## 3. Validation

- [x] 3.1 Add focused automated coverage for the unprepared-to-ready lifecycle, card action labels, per-card profile isolation, and ready-card updates; verify `npm test` passes.
- [x] 3.2 Run `npm run build` and inspect the Settings configuration cards at wide and narrow viewport widths without browser automation; verify controls, progress, and actions remain usable.
