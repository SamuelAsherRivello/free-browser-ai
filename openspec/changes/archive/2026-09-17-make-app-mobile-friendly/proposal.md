## Why

The fixed-height workspace preserves a focused desktop experience, but on narrow or height-constrained mobile viewports it hides content that does not fit inside panels whose overflow is disabled. Live review at 390x640 and 390x844 confirmed that About and Settings content becomes unreachable, including configured Provider Models and Persistence controls, so the responsive contract needs an explicit mobile scrolling model that leaves the PC experience intact.

## What Changes

- Introduce a responsive workspace state that distinguishes informational/setup views from an active conversation without changing the existing top-level About, Settings, and Chat information architecture.
- Keep the wide-screen PC workspace fixed to the available viewport with no document-level scrolling and preserve its current centered composition, navigation, project branding, panel proportions, and footer roles.
- On narrow viewports, provide one intentional, touch-friendly vertical scroll path for About, Settings, and conversation-setup content so every heading, control, configured model, Generation section, and Persistence action is reachable.
- For an active mobile conversation, retain an app-like shell in which the transcript is the primary vertical scroll region and the prompt controls remain reachable as the viewport changes.
- Prevent tiny or competing nested scroll regions, including the observed collapsed Provider Model list, while retaining horizontal scrolling for conversation tabs and rich content that genuinely requires it.
- Account for dynamic mobile viewport height, browser chrome, safe areas, short portrait screens, landscape screens, and the on-screen keyboard without introducing device-specific code paths.
- Preserve accessible focus behavior and provide at least 44-by-44 CSS-pixel touch targets for primary mobile navigation and controls where space permits without enlarging the PC controls.
- Add focused automated layout assertions and Chromium/WebKit verification at representative narrow, short, and wide viewport sizes, plus a Windows Chrome visual review, including checks that required content remains reachable and that the desktop document does not become scrollable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `browser-ai-chat`: Strengthen the static chat workspace requirement with explicit mobile content reachability, active-chat scrolling, dynamic viewport handling, touch-target, and desktop non-regression behavior.

## Impact

- Affects the workspace state classes and rendering context in `free-browser-ai/src/App.jsx`, responsive and overflow rules in `free-browser-ai/src/style.css`, and mobile viewport metadata in `free-browser-ai/index.html` if required by the selected safe-area approach.
- Extends `free-browser-ai/test/page.test.mjs` and browser-based verification for mobile portrait, reduced-height mobile, landscape, and desktop viewports.
- Does not change inference runtimes, Provider Model behavior, conversation persistence, public APIs, deployment architecture, or dependencies.
- Preserves the current desktop-first visual identity and interaction model; mobile-only adaptation is limited to layout, scrolling, viewport accommodation, and touch ergonomics.
