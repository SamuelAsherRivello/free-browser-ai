## Context

See `proposal.md` for motivation and the `browser-ai-chat` delta for the observable contract. The React application already knows the selected top-level view and whether an active conversation exists, but the rendered workspace does not expose those states to CSS. The current shell gives `#ui_layer` a `100dvh` height with hidden overflow, gives the workspace a fixed flex height, and also hides overflow on About/Settings and Chat panels. Only the Provider Model list and active transcript own vertical scrolling.

This model works as a contained PC workspace, including the existing wide-screen scale treatment, but it fails when stacked mobile content exceeds the remaining panel height. Live Chrome review measured 748 pixels of Settings content inside a 454-pixel panel at 390x640 while the panel remained `overflow-y: hidden`; the Provider Model list collapsed to an 8-pixel-high scroll region. At 390x844, About required 872 pixels inside a 658-pixel hidden-overflow panel. The implementation must correct scroll ownership without refactoring inference, persistence, or conversation state.

## Goals / Non-Goals

**Goals:**

- Make scroll ownership explicit for each combination of top-level view and conversation state.
- Preserve the existing fixed, centered PC workspace and its no-document-scroll behavior.
- Let normal mobile pages participate in browser scrolling while retaining an app-like active conversation with a reachable composer.
- Use the existing React, CSS, Vite, and Playwright stack with no new dependency.
- Cover narrow portrait, reduced-height portrait, mobile landscape, and wide desktop geometry with executable checks.

**Non-Goals:**

- Redesigning the visual identity, navigation labels, content hierarchy, model controls, or conversation workflow.
- Changing model preparation, generation, persistence, worker behavior, or storage formats.
- Creating separate desktop and mobile component trees or detecting specific device brands.
- Replacing the current wide-screen scale treatment unless verification shows that this change directly regresses it.

## Decisions

### 1. Expose layout state on the existing workspace root

Render stable state attributes on the workspace, such as the current view and whether Chat has an active conversation. CSS can then select informational/setup states separately from active-chat state without duplicating components or introducing viewport logic into React.

Alternatives considered:

- A single mobile overflow rule cannot serve both long Settings/About content and an active chat composer well.
- Applying body classes from effects creates global cleanup and synchronization concerns that are unnecessary when the state already belongs to the workspace.
- CSS `:has()` could infer active chat but would make the parent layout contract less explicit and harder to assert in tests.

### 2. Use a hybrid mobile scroll model

For narrow informational/setup states—About, Settings, empty Chat, and conversation creation—the workspace becomes content-height with a viewport-sized minimum. The document is the sole vertical scroll owner, panel overflow is visible, and vertically stacked lists expand naturally. Horizontal tab and rich-content overflow remain local because they represent a different axis or content type.

For active Chat, the workspace retains a viewport-constrained shell based on dynamic viewport units. The Chat panel and conversation remain min-height-aware flex containers, the transcript remains the sole primary vertical scroll region, and the prompt stays in the layout below it. This preserves the interaction advantage of the PC chat shell without trapping setup content in undersized nested regions.

Alternatives considered:

- Document scrolling for every mobile state is simple but lets the active prompt move far below a long transcript.
- Panel scrolling for every mobile state keeps the browser document locked but provides weaker mobile browser-chrome behavior and risks nested scrolling with Provider Models and transcripts.
- Making the complete application document-scrollable at every viewport would violate the requested PC experience.

### 3. Keep desktop rules as the baseline and isolate compact adaptations

The existing wide layout remains the default. Narrow-width rules continue at the established 600-pixel content breakpoint. A separate short-height adaptation applies only when a coarse primary pointer indicates a touch-oriented device, allowing mobile landscape to reduce vertical chrome without changing an ordinary short PC window. The short landscape layout uses the available horizontal space for a compact header rather than removing the title, project link, or primary navigation.

Alternatives considered:

- A height-only media query could unexpectedly restyle a short desktop window.
- User-agent detection would be brittle and unnecessary.
- Hiding required brand or navigation elements would save height but violate the workspace contract.

### 4. Use CSS-first dynamic viewport and safe-area handling

Retain `dvh` for viewport-constrained states, enable `viewport-fit=cover`, and include safe-area insets in mobile shell padding with fallbacks. Flex children that own overflow receive `min-height: 0`, while informational/setup states remove the height and overflow constraints that currently collapse their content. Focusable controls receive suitable scroll margin so browser focus scrolling can reveal them after keyboard or orientation changes.

No `VisualViewport` JavaScript synchronization is planned initially. It will be introduced only if the target browser check demonstrates that standards-based dynamic units and focus scrolling are insufficient.

Alternatives considered:

- A JavaScript-maintained `--vh` variable adds resize listeners and lifecycle complexity before evidence shows it is required.
- Static `100vh` does not represent the changing visible area reliably enough for the active mobile shell.

### 5. Preserve desktop density while improving touch ergonomics conditionally

Primary navigation retains the existing desktop dimensions. Narrow or coarse-pointer rules provide at least 44-by-44 CSS-pixel targets, visible focus treatment, and non-overlapping equal-width navigation. Small secondary controls are enlarged only where mobile interaction requires it and where doing so does not collapse the content region.

### 6. Verify behavior with geometry, reachability, and regression checks

Retain the existing source-level test for required responsive rules, then add Playwright-backed checks using the installed Chromium and WebKit browser tooling. The checks will verify:

- At 390x844 and 390x640, About and Settings content can be reached through the intended vertical scroll owner, configured Provider Models do not collapse into a tiny nested region, and Persistence remains reachable.
- At a touch-enabled landscape viewport such as 844x390, required navigation and content remain operable without vertical clipping.
- With an active mobile conversation fixture, transcript overflow does not move the prompt controls out of reach and transcript auto-scroll behavior remains intact.
- At a representative wide viewport, the document remains non-scrollable, the existing centered composition remains visible, and the navigation/panel/footer stay within the viewport.
- Primary mobile navigation boxes meet the minimum touch dimensions and the page has no unintended horizontal overflow.

The browser fixture should seed only app-managed test state and must not prepare or download a model. Completion requires the automated Chromium and WebKit matrix plus a visual pass in the Windows default Chrome browser; physical-device smoke testing remains a useful follow-up rather than a release gate.

## Risks / Trade-offs

- [Switching between document and transcript scroll ownership can cause a scroll-position jump] → Keep the modes state-driven, reset only the newly active scroll owner when necessary, and cover view switching plus transcript auto-scroll in browser tests.
- [Nested overflow can reappear when Generation settings expand] → Make the mobile Settings document the sole vertical owner and test an expanded Provider Model configuration.
- [Mobile browser keyboards vary beyond desktop emulation] → Use dynamic viewport units, safe-area padding, focus reachability checks, and record physical Android/iOS smoke testing as optional follow-up rather than blocking this change.
- [The existing wide-screen transform complicates raw scroll-height assertions] → Assert visible bounding geometry and document-level overflow separately rather than treating transformed element `scrollHeight` as rendered height.
- [A compact landscape header could affect touch laptops] → Gate the height-specific rule with coarse-pointer capability and keep the established width breakpoint authoritative for portrait/narrow layouts.

## Migration Plan

1. Add workspace state attributes without changing saved state or user-visible behavior.
2. Introduce the mobile scroll-ownership, compact-height, safe-area, and touch-target rules behind responsive queries while retaining the desktop baseline.
3. Add automated layout and state fixtures, then run focused responsive checks, the full test suite, and the production build.
4. Verify the built app through automated Chromium and WebKit mobile emulation, then visually review Chrome at the specified mobile and desktop viewports and smoke test keyboard focus and view switching.

The change requires no data migration. Rollback consists of reverting the workspace state attributes, viewport metadata, responsive CSS, and their tests; persisted conversations and Provider Models remain compatible.
