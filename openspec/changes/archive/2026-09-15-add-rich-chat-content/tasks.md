## 1. Markdown Rendering Foundation

- [x] 1.1 Add maintained React-compatible Markdown and sanitization dependencies, configure supported Markdown extensions, and verify `npm install` resolves the dependency tree.
- [x] 1.2 Replace plain message paragraphs with a shared safe Markdown renderer for user and assistant messages, preserving original message strings and copy behavior; verify headings, lists, quotes, inline code, and tables render in a conversation.
- [x] 1.3 Restrict rendered links to `http`, `https`, and `mailto` destinations and render raw HTML or unsafe URLs as inert text; verify script markup and `javascript:` links cannot become active content.

## 2. Code And Responsive Presentation

- [x] 2.1 Render fenced code as distinct, whitespace-preserving code regions with an optional language label and no executable behavior; verify a tagged code block retains its source text.
- [x] 2.2 Add scoped rich-content styles for Markdown elements, tables, and horizontal overflow in code regions; verify wide code and tables remain contained on a narrow viewport.

## 3. Verification

- [x] 3.1 Add focused automated coverage for Markdown structures, safe-content handling, code-block presentation, and copying original text; verify the new tests pass with `npm test`.
- [x] 3.2 Run the complete production validation with `npm test` and `npm run build`, and verify the application builds successfully for the configured GitHub Pages base path.
