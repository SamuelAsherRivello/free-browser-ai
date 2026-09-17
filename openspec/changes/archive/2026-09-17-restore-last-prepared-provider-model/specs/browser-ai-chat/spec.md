## MODIFIED Requirements

### Requirement: Provider Model setup
The system SHALL provide a top-level Settings tab with a Provider Models section that initially contains no configurations. The user SHALL add a Provider Model by selecting Transformer.js or WebLLM, then selecting a compatible model. The initial catalog SHALL contain one validated chat model for each Provider. Adding a Provider Model SHALL create an unprepared configuration card with its generation settings visible and MUST NOT download or initialize the model. A configuration SHALL become available to conversations only after preparation succeeds. A ready configuration card SHALL provide Update Settings and Remove actions. The system SHALL remember only the most recently and successfully prepared configuration in app-managed local browser state. After a reload, the system SHALL restore all configuration records conservatively as needing preparation and SHALL automatically attempt to prepare that remembered configuration once when it still identifies an existing supported configuration. The system MUST NOT mark the configuration ready before initialization succeeds and MUST NOT automatically retry a failed startup preparation.

#### Scenario: Adding a Provider Model
- **WHEN** the user selects a Provider and compatible model in Settings and adds it
- **THEN** the system creates an unprepared Provider Model card with generation settings and a Prepare action without starting a download

#### Scenario: Preparing a Provider Model
- **WHEN** the user selects Prepare for an unprepared Provider Model
- **THEN** the system downloads and initializes that model, reports preparation progress in its card, and makes it ready for conversations only after preparation succeeds

#### Scenario: Updating a ready Provider Model
- **WHEN** a Provider Model has prepared successfully
- **THEN** its card shows Update Settings and Remove actions, and Update Settings exposes that card's generation settings without preparing the model again

#### Scenario: Provider changes available models
- **WHEN** the user selects a different Provider in Settings
- **THEN** the system replaces the model choices with the models available for that Provider

#### Scenario: Preventing a duplicate Provider Model
- **WHEN** the user adds a Provider Model with a Provider and model combination that already exists
- **THEN** the system reports a duplicate error and does not change the existing configuration

#### Scenario: Recovering a failed Provider Model
- **WHEN** a Provider Model fails to prepare
- **THEN** the system retains the failed configuration in Settings with Retry and Remove actions

#### Scenario: Restoring Provider Models after a reload
- **WHEN** the user reloads the page after a Provider Model prepared successfully
- **THEN** the system restores all configuration records as needing preparation, automatically prepares only the most recently successful configuration, reports its progress, and makes it ready only after initialization succeeds

#### Scenario: Replacing the remembered Provider Model
- **WHEN** a different Provider Model prepares successfully after an earlier configuration
- **THEN** only the newer successful configuration is selected for automatic preparation on the next reload

#### Scenario: Reloading without a valid remembered Provider Model
- **WHEN** no Provider Model has prepared successfully or the remembered configuration is missing, removed, or unsupported
- **THEN** the system performs no automatic preparation and leaves every restored configuration needing preparation

#### Scenario: Automatic preparation fails
- **WHEN** automatic startup preparation cannot initialize the remembered Provider Model
- **THEN** the system shows that configuration's recoverable failed state without marking it ready or starting another automatic attempt

#### Scenario: Removing a Provider Model
- **WHEN** the user removes a Provider Model that is used by conversations
- **THEN** the system closes those conversations, removes the Provider Model from Settings and future conversation choices, and clears it from automatic startup preparation when it was the remembered configuration
