## MODIFIED Requirements

### Requirement: Free Browser AI static chat workspace
The system SHALL deliver the Free Browser AI chat workspace as a static browser application compatible with the renamed repository's configured GitHub Pages path. The workspace SHALL remain usable on supported narrow and wide viewports, and its interactive controls SHALL be keyboard accessible while retaining the required title, project-link, version, and lower-left settings corner roles. The workspace SHALL use top-level About, Settings, Chat, and Stats navigation without the prior marketing eyebrow or headline. On supported wide viewports, the workspace MUST fit within the available viewport without document-level vertical scrolling and MUST preserve its centered desktop composition. On supported narrow viewports, all About, Settings, Stats, and conversation-setup content MUST remain reachable through one unambiguous vertical scroll path without collapsed or competing nested vertical scroll regions. When a conversation is active on a narrow viewport, the transcript SHALL be the primary vertical scroll region and the prompt controls MUST remain reachable. The workspace MUST adapt when mobile browser chrome, safe areas, orientation changes, or the on-screen keyboard alter the available viewport, and focused controls MUST NOT remain permanently obscured. Primary mobile navigation targets MUST be at least 44 by 44 CSS pixels without requiring desktop controls to use the same sizing.

#### Scenario: Static production build
- **WHEN** the production build is served from the configured Free Browser AI GitHub Pages project path
- **THEN** the application loads the Free Browser AI chat workspace without requiring visitor authentication or an application server for local inference

#### Scenario: Keyboard tab management
- **WHEN** a keyboard user navigates the chat workspace
- **THEN** the user can reach and operate About, Chat, Settings, and Stats navigation, Provider Model management, conversation creation and selection, tab close, prompt controls, and Shift+Enter submission

#### Scenario: Mobile informational and setup content remains reachable
- **WHEN** a user opens About, Settings, Stats, or conversation setup on a supported narrow or reduced-height viewport
- **THEN** every heading, configured Provider Model, Generation control, Persistence action, aggregate statistic, privacy disclosure, and conversation-setup control can be reached through one clear vertical scroll path

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
