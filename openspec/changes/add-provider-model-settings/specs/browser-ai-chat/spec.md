## ADDED Requirements

### Requirement: Model-specific generation settings
The system SHALL provide a Generation section in Settings for the selected Provider Model. It MUST expose accessible controls for Temperature, Top P, Repetition Penalty, and Response Length, each with a visible current value and plain-language guidance. The system SHALL provide a recommended profile for each catalog model and SHALL apply that model's effective profile to the next generated response. A user MAY override a setting; overrides MUST be retained independently for each provider/model pair across reloads. The system MUST provide a Restore recommended settings action that restores the selected provider/model pair to its recommended profile. The initial selectable model catalog and its published runtime documentation MUST identify the same supported models.

#### Scenario: Viewing recommended settings for a configured model
- **WHEN** a user selects a Provider Model in Settings that has no saved overrides
- **THEN** the Generation section displays that model's recommended values and identifies them as recommended

#### Scenario: Overriding settings for one model
- **WHEN** a user changes one or more Generation controls for a Provider Model and later selects a different Provider Model
- **THEN** the other model displays its own recommended values or saved overrides without inheriting the first model's values

#### Scenario: Restoring a recommended profile
- **WHEN** a user selects Restore recommended settings for a Provider Model with saved overrides
- **THEN** the system replaces that model's overrides with its recommended values and uses them for its next response

#### Scenario: Applying generation settings
- **WHEN** a user submits a prompt after setting Generation controls
- **THEN** the selected local runtime uses the effective Temperature, Top P, Repetition Penalty, and Response Length for that response

#### Scenario: Understanding a generation control
- **WHEN** a user focuses a Generation control
- **THEN** the control exposes its name, current value, range, and plain-language purpose to keyboard and assistive-technology users
