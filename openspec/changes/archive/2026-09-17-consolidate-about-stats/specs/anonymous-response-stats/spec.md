## MODIFIED Requirements

### Requirement: Present public aggregate response statistics
The system SHALL present public aggregate response statistics inside the About view rather than as a standalone top-level Stats view. The embedded statistics presentation MUST display the overall average completed-response duration and grouped provider/model results using a compact layout suitable for roughly the lower half of the About panel. Each provider/model result MUST show the provider, model, successful response count, and average response duration. The embedded presentation MUST provide distinct loading, empty, unavailable, and populated states and MUST NOT expose individual measurements or cumulative duration totals.

#### Scenario: Aggregates are available
- **WHEN** a visitor opens About and aggregate measurements exist
- **THEN** the About view displays the overall average and grouped provider/model results with response counts and average durations

#### Scenario: No aggregate measurements exist
- **WHEN** a visitor opens About before any valid measurement has been stored
- **THEN** the embedded statistics presentation shows an empty state without inventing an average or provider/model results

#### Scenario: Aggregate retrieval fails
- **WHEN** aggregate statistics cannot be retrieved
- **THEN** the About view presents an unavailable statistics state while About, Settings, and Chat remain usable

### Requirement: Disclose the telemetry privacy boundary
The system SHALL clearly disclose in the About view that conversations and inference stay in the browser while a successful response sends only provider, model, and elapsed duration to shared analytics. The disclosure MUST state that prompts, responses, identities, device identifiers, and application timestamps are not stored in the analytics data store. The disclosure MAY be compact, but it MUST remain visible with the embedded statistics presentation.

#### Scenario: Visitor reviews Stats privacy information
- **WHEN** a visitor opens About
- **THEN** the visitor can read the telemetry fields that are collected and the conversation and identity fields that are not collected
