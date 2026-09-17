# browser-ai-chat Specification

## Purpose

Provide independent, private Free Browser AI conversations that users can compare across local runtime providers and compatible models.

## Requirements

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
The system SHALL deliver the Free Browser AI chat workspace as a static browser application compatible with the renamed repository's configured GitHub Pages path. The workspace SHALL remain usable on supported narrow and wide viewports, and its interactive controls SHALL be keyboard accessible while retaining the required title, project-link, version, and lower-left settings corner roles. The workspace SHALL use top-level About, Settings, and Chat navigation without the prior marketing eyebrow or headline and without a standalone Stats navigation target. The About view SHALL include compact project information and embedded anonymous response statistics. On supported wide viewports, the workspace MUST fit within the available viewport without document-level vertical scrolling and MUST preserve its centered desktop composition. On supported narrow viewports, all About, Settings, and conversation-setup content MUST remain reachable through one unambiguous vertical scroll path without collapsed or competing nested vertical scroll regions. When a conversation is active on a narrow viewport, the transcript SHALL be the primary vertical scroll region and the prompt controls MUST remain reachable. The workspace MUST adapt when mobile browser chrome, safe areas, orientation changes, or the on-screen keyboard alter the available viewport, and focused controls MUST NOT remain permanently obscured. Primary mobile navigation targets MUST be at least 44 by 44 CSS pixels without requiring desktop controls to use the same sizing.

#### Scenario: Static production build
- **WHEN** the production build is served from the configured Free Browser AI GitHub Pages project path
- **THEN** the application loads the Free Browser AI chat workspace without requiring visitor authentication or an application server for local inference

#### Scenario: Keyboard tab management
- **WHEN** a keyboard user navigates the chat workspace
- **THEN** the user can reach and operate About, Chat and Settings navigation, Provider Model management, conversation creation and selection, tab close, prompt controls, and Shift+Enter submission

#### Scenario: Mobile informational and setup content remains reachable
- **WHEN** a user opens About, Settings, or conversation setup on a supported narrow or reduced-height viewport
- **THEN** every About heading, compact statistic, privacy disclosure, configured Provider Model, Generation control, Persistence action, and conversation-setup control can be reached through one clear vertical scroll path

#### Scenario: Active mobile conversation preserves chat controls
- **WHEN** a user views an active conversation on a supported narrow viewport and its transcript exceeds the available height
- **THEN** the transcript scrolls while the conversation navigation and prompt controls remain reachable

#### Scenario: Mobile viewport height changes
- **WHEN** browser chrome, a safe-area inset, an orientation change, or the on-screen keyboard reduces the available mobile viewport
- **THEN** the workspace recomputes its usable height without permanently hiding the focused control or required content

#### Scenario: Wide viewport retains the PC experience
- **WHEN** the workspace is shown on a supported wide viewport with content that fits its designated internal regions
- **THEN** the centered workspace, top navigation, content panel, and footer remain within the viewport without document-level vertical scrolling

#### Scenario: Primary mobile navigation is touch accessible
- **WHEN** the top-level workspace navigation is shown on a supported narrow viewport
- **THEN** each primary navigation target exposes a touch area of at least 44 by 44 CSS pixels without overlap or horizontal clipping
