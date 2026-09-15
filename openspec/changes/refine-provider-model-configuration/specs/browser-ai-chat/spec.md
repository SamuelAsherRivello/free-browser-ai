## MODIFIED Requirements

### Requirement: Provider Model setup
The system SHALL provide a top-level Settings tab with a Provider Models section that initially contains no configurations. The user SHALL add a Provider Model by selecting Transformer.js or WebLLM, then selecting a compatible model. The initial catalog SHALL contain one validated chat model for each Provider. Adding a Provider Model SHALL create an unprepared configuration card with its generation settings visible and MUST NOT download or initialize the model. A configuration SHALL become available to conversations only after the user selects Prepare and preparation succeeds. A ready configuration card SHALL provide Update Settings and Remove actions.

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
- **WHEN** the user reloads the page after adding Provider Models
- **THEN** the system restores their configuration records as needing preparation and does not automatically prepare them

#### Scenario: Removing a Provider Model
- **WHEN** the user removes a Provider Model that is used by conversations
- **THEN** the system closes those conversations and removes the Provider Model from Settings and future conversation choices

## ADDED Requirements

### Requirement: Card-level generation settings
The system SHALL display each Provider Model's generation settings only in that model's configuration card. Before preparation, a card MUST let the user view, change, and restore its Temperature, Top P, Repetition Penalty, and Response Length values. A ready card MUST keep its generation values hidden until the user selects Update Settings. A change to one card's settings MUST NOT alter another card's values, and the selected values SHALL apply to that Provider Model's next response.

#### Scenario: Configuring before preparation
- **WHEN** a user adds a Provider Model
- **THEN** the new card displays its recommended generation values before the user selects Prepare

#### Scenario: Isolating card settings
- **WHEN** a user changes generation settings for one Provider Model card
- **THEN** another Provider Model card retains its own recommended or previously saved values

#### Scenario: Applying updated ready settings
- **WHEN** a user selects Update Settings on a ready card, changes a generation value, and submits a later prompt in that model's conversation
- **THEN** the response uses the updated value without re-preparing the model
