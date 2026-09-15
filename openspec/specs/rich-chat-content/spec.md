# rich-chat-content Specification

## Purpose

Provide readable, safe rendering of structured model and user messages in every local browser chat conversation.

## Requirements

### Requirement: Render supported Markdown message content
The system SHALL render both user and assistant message content as Markdown in every conversation tab. It MUST support paragraphs, headings, emphasis, ordered and unordered lists, blockquotes, links, inline code, fenced code blocks, and tables. Unsupported or malformed Markdown MUST remain visible as text without preventing the rest of the message from rendering.

#### Scenario: Assistant returns structured Markdown
- **WHEN** an assistant message contains a heading, a list, emphasis, and a blockquote
- **THEN** the conversation displays the corresponding structured content in the message

#### Scenario: User submits a Markdown prompt
- **WHEN** a user message contains supported Markdown
- **THEN** the submitted message uses the same structured rendering as an assistant message

### Requirement: Present fenced code safely and legibly
The system SHALL render fenced code as a distinct code region that preserves whitespace and source characters. A code region MUST be horizontally scrollable when needed and MUST display its declared language hint when one is present. Message code MUST NOT execute in the browser.

#### Scenario: Assistant returns a language-tagged code block
- **WHEN** an assistant message contains a fenced code block tagged with a language
- **THEN** the message displays the language hint and the unmodified code in a distinct code region

#### Scenario: Assistant returns long code lines
- **WHEN** a fenced code block contains a line wider than the message area
- **THEN** the code region can scroll horizontally without widening the conversation layout

### Requirement: Prevent active and unsafe rendered content
The system SHALL treat raw HTML in message content as text and MUST NOT render executable markup, scripts, event handlers, embedded frames, or externally loaded media. The system MUST only render links using `http`, `https`, or `mailto` protocols; other link destinations MUST be displayed as non-navigable text.

#### Scenario: Assistant returns script markup
- **WHEN** an assistant message includes a script tag or an HTML event handler
- **THEN** the markup is displayed as inert text and no script or handler runs

#### Scenario: Assistant returns an unsafe link
- **WHEN** an assistant message contains a link using an unsafe protocol such as `javascript:`
- **THEN** the destination is not navigable from the conversation

### Requirement: Preserve message interaction and accessibility
The system SHALL preserve the existing message-level copy action and accessible sender identification after rich rendering is enabled. Rendered content MUST remain readable in the existing responsive conversation layout.

#### Scenario: Copying a rich message
- **WHEN** a user activates the copy action on a message containing Markdown and code
- **THEN** the system copies the original message text to the clipboard

#### Scenario: Viewing rich content on a narrow viewport
- **WHEN** a conversation containing a table or code block is viewed on a narrow viewport
- **THEN** the conversation remains within the viewport and the content can be read or scrolled as needed
