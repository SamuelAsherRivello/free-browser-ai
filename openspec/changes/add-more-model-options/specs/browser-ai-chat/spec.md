## MODIFIED Requirements

### Requirement: Provider Model setup
The system SHALL provide a top-level Settings tab with a Provider Models section that initially contains no configurations. The user SHALL add a Provider Model by selecting Transformers.js or WebLLM, then selecting a compatible model. The catalog SHALL contain exactly two validated Qwen2.5 Instruct chat models for each provider: a lightweight 0.5B option and a powerful 1.5B option. Each model option in the Settings dropdown SHALL identify its capability tier and curated approximate download size. The system SHALL immediately prepare the added model in Settings and show preparation progress there. A configuration SHALL become available to conversations only after preparation succeeds.

#### Scenario: Preparing a Provider Model
- **WHEN** the user selects a Provider and compatible model in Settings and adds it
- **THEN** the system creates a loading Provider Model configuration and reports preparation progress in Settings until it becomes ready or fails

#### Scenario: Provider changes available models
- **WHEN** the user selects a different Provider in Settings
- **THEN** the system replaces the model choices with that provider's lightweight and powerful Qwen2.5 Instruct options and their approximate download sizes

#### Scenario: Identifying model resource cost
- **WHEN** the user opens the Settings model dropdown
- **THEN** every available option identifies whether it is lightweight or powerful and displays its curated approximate download size before the user adds it

#### Scenario: Preventing a duplicate Provider Model
- **WHEN** the user adds a Provider Model with a Provider and model combination that already exists
- **THEN** the system reports a duplicate error and does not change the existing configuration

#### Scenario: Recovering a failed Provider Model
- **WHEN** a Provider Model fails to prepare
- **THEN** the system retains the failed configuration in Settings with Retry and Remove actions

#### Scenario: Resetting incompatible saved configurations
- **WHEN** the user loads the workspace after a catalog upgrade from the previous model set
- **THEN** the system removes all app-managed saved Provider Model configurations and conversations and opens the new-conversation state

#### Scenario: Restoring Provider Models after a reload
- **WHEN** the user reloads the page after adding Provider Models without a catalog upgrade
- **THEN** the system restores their configuration records as needing preparation and does not automatically prepare them

#### Scenario: Removing a Provider Model
- **WHEN** the user removes a Provider Model that is used by conversations
- **THEN** the system closes those conversations and removes the Provider Model from Settings and future conversation choices
