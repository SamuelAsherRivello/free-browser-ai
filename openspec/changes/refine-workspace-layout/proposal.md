## Why

The workspace currently separates the project title, GitHub link, and version into fixed page corners and caps the content panel with a viewport-derived height. This leaves unused vertical space and makes the header, page navigation, card bounds, and chat scrolling feel disconnected.

## What Changes

- Place the project title on the left and the GitHub project link on the right of a shared, centered workspace header.
- Keep the workspace navigation directly beneath that header and retain the existing content beneath the tabs.
- Make the active content card fill the remaining viewport height, with its bottom gutter matching the space between the navigation and card.
- Add a CSS custom property for the horizontal workspace gutter while retaining the current maximum content width.
- Keep document scrolling disabled; only the active view content may scroll when it exceeds the card.
- Keep Chat controls fixed within the card, with only the message-history area scrolling and prompt controls anchored at the bottom.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `browser-ai-chat`: Refine static workspace structure, responsive card sizing, and tab-specific scrolling behavior.

## Impact

- Affects the workspace structure in `free-browser-ai/src/App.jsx` and layout styles in `free-browser-ai/src/style.css`.
- Preserves local runtime behavior, conversation state, and existing accessible controls.
- Extends layout-focused validation in `free-browser-ai/test/page.test.mjs`; `npm test` and `npm run build` remain the required checks.
