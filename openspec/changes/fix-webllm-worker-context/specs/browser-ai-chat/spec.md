## MODIFIED Requirements

### Requirement: Browser-only inference and availability feedback
The system SHALL execute selected runtime inference in the user's browser without requiring an API key or an application backend. Before or while preparing a conversation, the system SHALL report in that tab when its selected Provider or model is unavailable, cannot load, or cannot generate a response, and SHALL keep other tabs usable. When a WebLLM Provider Model is supported by the installed runtime and the browser exposes a compatible WebGPU adapter, the system SHALL initialize its worker and prepare the selected model without a worker-context failure. When WebLLM worker initialization fails, the system SHALL terminate the failed worker and report the underlying failure as a recoverable error for only the affected Provider Model.

#### Scenario: WebLLM is unavailable in the browser
- **WHEN** the user attempts to start or use a WebLLM tab in a browser that does not meet its runtime requirements
- **THEN** the system explains that the selected Provider is unavailable in that tab and allows the user to create or use another tab

#### Scenario: Supported WebLLM model prepares
- **WHEN** the user prepares a catalog WebLLM model in a browser with a compatible WebGPU adapter
- **THEN** the WebLLM worker initializes and the Provider Model becomes ready without reporting `this.handleTask is not a function`

#### Scenario: WebLLM worker initialization fails
- **WHEN** a WebLLM worker throws while initializing a selected model
- **THEN** the system terminates that worker and displays the worker's failure detail on the affected Provider Model without altering another conversation or Provider Model

#### Scenario: Model loading fails
- **WHEN** a selected model fails to download or initialize
- **THEN** the system displays a recoverable error in the affected tab and does not alter messages or state in other tabs
