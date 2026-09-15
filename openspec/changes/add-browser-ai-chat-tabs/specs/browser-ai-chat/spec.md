## Purpose

Provide independent, private Free Browser AI conversations that users can compare across local runtime providers and compatible models.

## ADDED Requirements

### Requirement: Conversation tab lifecycle
The system SHALL let a user create multiple conversation tabs, switch the active tab, and close an existing tab. Closing a tab MUST remove only that tab's conversation state and MUST select another remaining tab or return to the new-conversation state when none remain. The system SHALL preserve each remaining tab's configuration and transcript across page reloads using app-managed browser local storage.

#### Scenario: Creating and switching conversations
- **WHEN** the user creates two conversations and selects either tab
- **THEN** the system displays the selected conversation without changing the other tab's messages or configuration

#### Scenario: Closing the active tab
- **WHEN** the user closes the active conversation tab
- **THEN** the system removes that tab and displays another available tab or the new-conversation selection UI

#### Scenario: Restoring conversations after a reload
- **WHEN** the user reloads the page after creating conversations and exchanging messages
- **THEN** the system restores the stored tabs, their provider and model selections, and their message histories

### Requirement: Provider Model setup
The system SHALL provide a top-level Settings tab with a Provider Models section that initially contains no configurations. The user SHALL add a Provider Model by selecting Transformer.js or WebLLM, then selecting a compatible model. The initial catalog SHALL contain one validated chat model for each Provider. The system SHALL immediately prepare the added model in Settings and show preparation progress there. A configuration SHALL become available to conversations only after preparation succeeds.

#### Scenario: Preparing a Provider Model
- **WHEN** the user selects a Provider and compatible model in Settings and adds it
- **THEN** the system creates a loading Provider Model configuration and reports preparation progress in Settings until it becomes ready or fails

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

### Requirement: Independent local conversation state
The system SHALL retain a separate Provider, model, message history, response-generation state, and error state for each conversation tab during the browser session. Prompting or loading one tab MUST NOT send, replace, or render messages in another tab.

#### Scenario: Concurrently configured conversations
- **WHEN** the user creates one tab with Transformer.js and another with WebLLM
- **THEN** each tab continues to show its own Provider, model, and message history after the user switches between them

### Requirement: Chat creation and prompt submission
The system SHALL provide a top-level Chat tab that lets the user add and navigate conversation tabs. Each new conversation SHALL require selection of a ready Provider Model, visibly identified by Provider and model name. When no ready Provider Models exist, the system SHALL disable prompt submission. In the prompt editor, Enter SHALL insert a newline and Shift+Enter SHALL submit the prompt; the submit control SHALL be labeled `Submit (Shift+Enter)`.

#### Scenario: Creating a conversation from a ready Provider Model
- **WHEN** the user adds a conversation and selects a ready Provider Model
- **THEN** the system creates a conversation tab configured with that Provider Model

#### Scenario: No ready Provider Models
- **WHEN** the user opens Chat before preparing a Provider Model
- **THEN** the system disables prompt submission and directs the user to Settings

#### Scenario: Submitting a multiline prompt
- **WHEN** the user presses Enter in the prompt editor
- **THEN** the system inserts a newline without submitting

#### Scenario: Submitting with Shift+Enter
- **WHEN** the user presses Shift+Enter in the prompt editor
- **THEN** the system submits the prompt for the active conversation

### Requirement: Streaming generation, recovery, and copying
The system SHALL stream each generated response in its conversation tab and provide a control to stop that tab's active generation. When a generation stops or fails, the system SHALL retain any partial response text and offer a tab-local Retry control that resubmits the originating prompt. The system SHALL provide a copy-to-clipboard control for every user prompt and generated response.

#### Scenario: Stopping a streamed response
- **WHEN** the user stops an active response generation
- **THEN** the system retains the generated partial text, stops only that tab's generation, and offers Retry for the original prompt

#### Scenario: Retrying a failed response
- **WHEN** generation fails after producing partial text and the user selects Retry
- **THEN** the system retries the originating prompt in the affected tab without changing another tab's messages or state

#### Scenario: Copying a message
- **WHEN** the user selects the copy control for a prompt or response
- **THEN** the system places that message's text on the browser clipboard

### Requirement: Browser-only inference and availability feedback
The system SHALL execute selected runtime inference in the user's browser without requiring an API key or an application backend. Before or while preparing a conversation, the system SHALL report in that tab when its selected Provider or model is unavailable, cannot load, or cannot generate a response, and SHALL keep other tabs usable.

#### Scenario: WebLLM is unavailable in the browser
- **WHEN** the user attempts to start or use a WebLLM tab in a browser that does not meet its runtime requirements
- **THEN** the system explains that the selected Provider is unavailable in that tab and allows the user to create or use another tab

#### Scenario: Model loading fails
- **WHEN** a selected model fails to download or initialize
- **THEN** the system displays a recoverable error in the affected tab and does not alter messages or state in other tabs

### Requirement: Local data reset
The system SHALL provide a clear Reset control that clears all app-managed local-storage conversations and settings, then refreshes the page. The system SHALL communicate that downloaded model files cached outside app-managed local storage can remain available after reset.

#### Scenario: Resetting app-managed data
- **WHEN** the user selects Reset
- **THEN** the system clears its local-storage conversations and settings, refreshes the page, and returns to the new-conversation state

### Requirement: Free Browser AI static chat workspace
The system SHALL deliver the Free Browser AI chat workspace as a static browser application compatible with the renamed repository's configured GitHub Pages path. The workspace SHALL remain usable on supported narrow and wide viewports, and its interactive controls SHALL be keyboard accessible while retaining the required title, project-link, version, and lower-left settings corner roles. The workspace SHALL use top-level Chat and Settings navigation without the prior marketing eyebrow or headline.

#### Scenario: Static production build
- **WHEN** the production build is served from the configured Free Browser AI GitHub Pages project path
- **THEN** the application loads the Free Browser AI chat workspace and requires no authentication or application server endpoint

#### Scenario: Keyboard tab management
- **WHEN** a keyboard user navigates the chat workspace
- **THEN** the user can reach and operate Chat and Settings navigation, Provider Model management, conversation creation and selection, tab close, prompt controls, and Shift+Enter submission
