## 1. Responsive Regression Coverage

- [x] 1.1 Add focused source-level assertions for workspace view/conversation state attributes, dynamic viewport metadata, safe-area rules, and mobile scroll ownership; run the targeted Node test first and verify it fails against the current implementation for the expected missing behavior.
- [x] 1.2 Add a Playwright responsive-layout test fixture for Chromium and WebKit that seeds app-managed Provider Model and conversation state without preparing or downloading a model; verify the fixture can open About, Settings, empty/conversation-setup Chat, and active Chat deterministically in both engines.
- [x] 1.3 Encode the observed 390x640 and 390x844 failures as geometry/reachability assertions for About, configured Provider Models, expanded Generation settings, and Persistence; run the focused browser test and verify the current hidden-overflow layout fails for content reachability rather than test setup.

## 2. State-Aware Workspace Layout

- [x] 2.1 Expose the current top-level view and active-conversation state on the existing workspace root in `App.jsx`; verify the focused state-attribute test passes without changing saved application state or navigation behavior.
- [x] 2.2 Add `viewport-fit=cover`, safe-area-aware mobile padding, focus scroll margins, and dynamic-viewport sizing in `index.html` and `style.css`; verify the source-level viewport and safe-area assertions pass.
- [x] 2.3 Implement document-owned vertical scrolling for narrow About, Settings, empty Chat, and conversation-setup states, including expansion of the Provider Model list instead of a nested collapsed region; verify the 390x640 and 390x844 browser checks can reach all required content and show no unintended horizontal overflow.
- [x] 2.4 Implement the narrow active-conversation shell so the transcript owns vertical overflow while conversation tabs and prompt controls remain reachable; verify the active-chat fixture passes transcript overflow, prompt visibility, and existing auto-scroll checks.
- [x] 2.5 Add coarse-pointer short-height/landscape adaptations and conditional mobile touch sizing without changing desktop control density; verify an 844x390 touch viewport retains the title, project link, primary navigation, and operable content, and verify each primary navigation target is at least 44 by 44 CSS pixels.

## 3. Desktop Preservation And Integration Verification

- [x] 3.1 Add a wide-viewport regression check for the existing centered navigation, panel, and footer composition; verify the document remains vertically non-scrollable and all required desktop regions stay within the visible viewport.
- [x] 3.2 Exercise About, Settings, conversation setup, and active Chat while switching between representative mobile and desktop viewport sizes; verify scroll ownership changes cleanly, keyboard focus stays reachable, and no view retains a stale scroll position that hides its heading or controls.
- [x] 3.3 Run `npm.cmd test`, the focused Playwright responsive suite in Chromium and WebKit, `npm.cmd run build`, and `git diff --check`; verify all checks pass and report any existing unrelated build-size warning separately from responsive correctness.
- [x] 3.4 Open the built or development app in Windows Chrome at the normal desktop viewport and temporary 390x844, 390x640, and 844x390 overrides; verify the final visuals match the responsive contract, then restore the browser viewport and leave the PC presentation unchanged. Record physical Android/iOS smoke testing as optional follow-up, not a completion gate.
