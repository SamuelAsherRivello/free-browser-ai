## Why

Chat responses are currently rendered as plain text, which makes model-produced Markdown difficult to read and code examples difficult to identify or copy. Supporting a safe, broadly understood Markdown subset lets local models communicate structured explanations and code without introducing hosted content or executable markup.

## What Changes

- Render user and assistant message text as sanitized Markdown in every conversation tab.
- Support common reading and response formats: paragraphs, headings, emphasis, lists, blockquotes, links, inline code, fenced code blocks, and tables.
- Present fenced code blocks as distinct, scrollable code regions that retain their language hint when supplied.
- Keep unrecognized or malformed Markdown visible as text and render raw HTML as text rather than interpreting it.
- Restrict links to safe web and mail protocols and preserve the existing message-level copy action.

## Capabilities

### New Capabilities
- `rich-chat-content`: Safely render structured Markdown and fenced code in conversation messages.

### Modified Capabilities
- None.

## Impact

- Affects `free-browser-ai/src/App.jsx` message rendering and `free-browser-ai/src/style.css` message presentation.
- Adds a client-side Markdown parsing and sanitization dependency, selected for React and browser compatibility.
- Extends `free-browser-ai/test/page.test.mjs` with focused rendering and safety coverage; `npm test` and `npm run build` remain validation commands.
