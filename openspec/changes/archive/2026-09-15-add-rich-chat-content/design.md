## Context

See proposal.md for motivation. `Conversation` currently maps each stored message to a sender label and a plain paragraph in `free-browser-ai/src/App.jsx`; the message text is persisted as the original string and copied directly to the clipboard. Styling in `free-browser-ai/src/style.css` handles plain-text whitespace but has no element-level rich-content rules. The application is a static Vite React app with no server-side content transformation.

## Goals / Non-Goals

**Goals:**
- Render a documented CommonMark-style response subset consistently for user and assistant messages.
- Maintain a strict no-active-content boundary for untrusted model output.
- Preserve stored message text, streaming behavior, and the existing copy control.
- Keep code blocks and wide tables usable on desktop and narrow viewports.

**Non-Goals:**
- Rendering raw HTML, iframes, images, video, or arbitrary external embeds.
- Executing, syntax-highlighting, editing, or running code returned by a model.
- Changing model adapters, message persistence format, or streamed token transport.

## Decisions

### Use a React-compatible Markdown renderer with sanitization

Add a maintained client-side Markdown renderer suitable for React plus its required sanitization layer. Configure the renderer to parse the supported Markdown subset and disallow raw HTML. This provides predictable rendering while keeping model output untrusted.

Alternative: custom parsing with regular expressions. Rejected because Markdown edge cases and URL safety are difficult to implement and maintain correctly.

### Render original message strings at display time

Keep `message.content` as the original model or user text and transform it only in the message component. The existing streaming updates and copy action remain unchanged, and stored conversations need no migration.

Alternative: persist parsed content. Rejected because it complicates storage compatibility, copying, and incremental streaming without user-visible benefit.

### Restrict navigation and exclude embeds

Allow only `http`, `https`, and `mailto` links. Render other destinations as non-navigable text; do not enable raw HTML or renderer extensions for images, frames, or arbitrary embeds. This matches the static, local-browser privacy boundary and avoids active content from model output.

Alternative: allow all Markdown extensions and sanitize afterward. Rejected because extensions increase the content surface and undermine the requested safe general format.

### Add semantic content styling at the presentation boundary

Style renderer output beneath each message for headings, lists, quotes, tables, inline code, links, and preformatted code. Code and tables receive horizontal overflow containment so they do not expand the transcript on narrow screens.

Alternative: inherit all global styles. Rejected because the current styles only target paragraphs and cannot maintain readable spacing or responsive overflow for rich elements.

## Risks / Trade-offs

- [Markdown dependency increases client bundle size] -> Select a small, maintained React-compatible package and confirm the production build size remains acceptable.
- [Streaming partial syntax can briefly render differently while a message is incomplete] -> Re-render from the complete accumulated string on each token; malformed intermediate syntax remains visible as text.
- [Links can lead away from the local workspace] -> Restrict protocols and apply safe external-link behavior.
- [Wide tables and code can reduce readability on phones] -> Contain horizontal scrolling within the content region and verify the narrow layout.

## Migration Plan

1. Add the rendering and sanitization dependencies, message component, and scoped styles.
2. Add focused tests for supported structures, code preservation, unsafe-content handling, and original-text copying.
3. Run `npm test` and `npm run build` before release.
4. Roll back by reverting the rendering dependency and message presentation changes; persisted conversation strings remain compatible with the plain-text renderer.
