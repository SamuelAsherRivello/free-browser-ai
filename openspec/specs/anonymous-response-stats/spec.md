# anonymous-response-stats Specification

## Purpose

Provide public, privacy-minimized timing statistics for completed local assistant responses without collecting conversation content or visitor identity data.

## Requirements

### Requirement: Measure one successful assistant response
The system SHALL measure user-perceived response duration with a monotonic browser timer beginning when a valid prompt submission is accepted and ending when the full assistant response completes successfully. The system MUST create at most one measurement for that response attempt and MUST NOT create a measurement for a failed or stopped attempt.

#### Scenario: Successful response is measured
- **WHEN** a valid prompt is accepted and its assistant response completes successfully
- **THEN** the system records one elapsed duration for that attempt from accepted submission through full completion

#### Scenario: Failed response is excluded
- **WHEN** response generation fails before successful completion
- **THEN** the system does not submit a timing measurement for that attempt

#### Scenario: Stopped response is excluded
- **WHEN** the user stops an in-progress response
- **THEN** the system does not submit a timing measurement for that attempt

#### Scenario: Successful retry is an independent sample
- **WHEN** a retry completes successfully after an earlier failed or stopped attempt
- **THEN** the system submits one measurement for the successful retry and none for the earlier attempt

### Requirement: Minimize and validate stored telemetry
The analytics data store SHALL immediately fold each accepted measurement into provider/model aggregate state containing only the provider identifier, model identifier, successful response count, and cumulative response duration. It MUST NOT retain an individual response event or raw per-response duration, prompt, assistant response, application timestamp, user, session, chat, message, request, or device identifier, IP address, user agent, or other personally identifiable or application-linkable data. The system MUST reject unsupported provider/model combinations and durations outside the documented valid range before changing the aggregate.

#### Scenario: Valid minimal metric is accepted
- **WHEN** the application submits a supported provider/model combination and an in-range integer duration
- **THEN** the data store atomically increments that provider/model response count and cumulative duration without creating an individual response record

#### Scenario: Unexpected fields are submitted
- **WHEN** a caller submits conversation content, an identifier, a timestamp, or another field outside the metric contract
- **THEN** the system does not retain the unexpected field

#### Scenario: Invalid metric is rejected
- **WHEN** a caller submits an unsupported provider/model combination or an out-of-range duration
- **THEN** the system rejects the measurement without adding it to the statistics

### Requirement: Restrict public analytics access
An unauthenticated public client SHALL be permitted only to submit a validated metric through the narrow metric operation and retrieve calculated statistics through the aggregate operation. Public clients MUST NOT be able to select the underlying aggregate state directly or update or delete it outside the validated submission operation, and elevated database credentials MUST NOT be shipped to the browser.

#### Scenario: Public client reads aggregates
- **WHEN** an unauthenticated visitor opens Stats with analytics available
- **THEN** the system returns aggregate results without returning individual stored rows

#### Scenario: Public client requests underlying state
- **WHEN** an unauthenticated client attempts to read the underlying aggregate records directly
- **THEN** the data store denies the request

#### Scenario: Public client attempts mutation outside submission
- **WHEN** an unauthenticated client attempts to update or delete stored metrics
- **THEN** the data store denies the request

### Requirement: Keep telemetry best-effort and isolated from chat
Metric submission SHALL run as a best-effort side effect after successful local generation. Missing configuration, network failure, rejection, timeout, or analytics service unavailability MUST NOT change the generated response, block further prompts, alter conversation state, or expose implementation details as a chat error.

#### Scenario: Metric submission fails
- **WHEN** the assistant response completes but metric submission fails
- **THEN** the completed response remains available and the conversation remains usable

#### Scenario: Analytics is not configured
- **WHEN** the application runs without its public analytics configuration
- **THEN** local chat remains usable and no metric submission is attempted

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
