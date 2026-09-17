## 1. Preserve Current Work And Establish Supabase Access

- [x] 1.1 Capture `git status`, the existing `App.jsx`/test scroll-following diff, and repository identity before implementation; verify the three pre-existing modified paths remain present and are not reverted or absorbed into unrelated cleanup.
- [x] 1.2 Add a temporary project-local `.codex/config.toml` Supabase Streamable HTTP entry limited to the account tools needed for project bootstrap with write prompts enabled; verify the file contains no token, password, publishable key, or access to storage, branching, or unrelated feature groups.
- [x] 1.3 Attempt the credential-free hosted MCP OAuth handoff and keep credentials out of chat and the workspace; direct `codex mcp login supabase` is currently blocked before browser authorization by Codex dynamic-client-registration issue #20503, so offer the official Supabase plugin connection and continue through the user's already-authenticated Supabase dashboard without storing a token.
- [x] 1.4 Confirm the sole organization, Free plan, and zero-incremental-cost project path, then use the authenticated Supabase dashboard fallback to create and verify the active `free-browser-ai` project in Supabase's recommended Sydney region; record only its non-secret project reference.
- [x] 1.5 Replace the temporary MCP entry with a `project_ref`-scoped Supabase entry restricted to database, development, and debugging feature groups with write prompts enabled; verify account, functions, branching, and storage tools are no longer exposed and no credential is committed.

## 2. Create The Aggregate-Only Database Boundary

- [x] 2.1 Add a non-destructive Supabase migration and database tests that create `private.response_stats`, seed the four catalog provider/model pairs, enable defense-in-depth RLS, revoke direct public table access, and define the exact `record_response_metric` and `get_response_stats` RPCs; verify the schema has only provider, model, response count, and cumulative duration with no event, timestamp, identity, content, IP, or user-agent columns.
- [x] 2.2 In database tests, cover the 1–3,600,000 ms duration boundary, unsupported pair rejection, atomic count/total increments, aggregate JSON shape, omission of cumulative totals from public output, and denied `anon` select/update/delete access; verify all SQL assertions pass in the available Supabase test path.
- [x] 2.3 Apply the reviewed migration to the dedicated project through the authenticated Supabase dashboard fallback and run Supabase security and performance advisors; verify only the two intended RPC signatures are executable by `anon`, the private table is not directly exposed, and the two intentional public SECURITY DEFINER warnings plus deny-all RLS informational finding are explicitly explained.
- [x] 2.4 Retrieve only the project URL and publishable key in the authenticated dashboard and transfer them directly to GitHub protected configuration without printing or persisting a local value; verify no `.env.local`, secret/service-role/database/OAuth credential, or key-bearing file appears in the workspace.

## 3. Add The Browser Metrics Adapter

- [x] 3.1 Add `@supabase/supabase-js` through the repository package manager and update the lockfile; verify `npm install` completes without unrelated dependency upgrades and `npm list @supabase/supabase-js` resolves the installed version.
- [x] 3.2 Add focused tests for missing configuration, aggregate retrieval states, minimal RPC arguments, invalid response handling, and swallowed submission failures; verify the new tests fail before the adapter exists and pass after implementation.
- [x] 3.3 Implement a small metrics adapter under `free-browser-ai/src/` that conditionally creates the public client, calls only the two RPCs, returns normalized aggregate results, never persists/retries a metric, and never logs payloads or configuration; verify its tests pass and source inspection shows no elevated credential path.

## 4. Measure Successful Responses Without Affecting Chat

- [x] 4.1 Add tests around the send flow proving one monotonic measurement is submitted after each successful completion, stopped/failed attempts submit nothing, a successful retry is a fresh single sample, and submission rejection does not enter conversation error state; verify the tests fail before instrumentation.
- [x] 4.2 Instrument the accepted-submit through successful-full-completion boundary with `performance.now()`, round the elapsed duration, and fire the minimal provider/model/duration submission without awaiting it; verify the focused tests pass and existing streaming, stop, retry, and auto-scroll behavior remains unchanged.
- [x] 4.3 Verify browser local storage never receives analytics state or an offline queue and that the existing `Date.now()` progress fields are not transmitted; use unit assertions and source inspection to confirm only the three RPC arguments leave the app.

## 5. Build The Accessible Stats View

- [x] 5.1 Add component/browser tests for Stats loading, empty, unavailable, and populated states; verify the populated fixture shows overall average plus Provider, Model, Responses, and Average response time columns without raw durations or cumulative totals.
- [x] 5.2 Add Stats as the fourth top-level view, restore `stats` safely from local state, fetch aggregates when the view opens, and show the exact privacy disclosure; verify keyboard navigation reaches all four views and analytics failure leaves About, Settings, and Chat usable.
- [x] 5.3 Update responsive styles for four mobile navigation targets and a single document scroll path on Stats while retaining the fixed wide layout; verify Chromium and WebKit checks confirm at least 44-by-44 CSS pixel primary targets, no horizontal clipping, reachable Stats content, and unchanged active-chat scroll ownership.

## 6. Configure Deployment And Document Privacy

- [x] 6.1 Add a committed `.env.example` containing placeholders only and update the GitHub Pages workflow to inject `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` during build; verify an unconfigured local build remains functional and the workflow contains no literal project value or credential.
- [x] 6.2 After verifying the GitHub remote identity, store the project URL and publishable key in the repository's protected Pages configuration through the authenticated GitHub interface without echoing values; verify the secret name and public URL variable exist while logs and repository files do not reveal the key.
- [x] 6.3 Update README and relevant runtime documentation to explain aggregate-only timing telemetry, the exact submitted fields, excluded data, public-key/RPC security model, unverified-community-data limitation, local setup, and Stats behavior; verify no documentation still claims that every application datum stays exclusively on-device.

## 7. Verify Database, Application, And Release Readiness

- [x] 7.1 Run `npm test`, `npm run test:responsive`, and `npm run build` from the repository root; verify all suites pass and the production bundle builds at the configured `/free-browser-ai/` base path.
- [x] 7.2 Serve the production build and perform real-browser checks with analytics configured and with its requests deliberately unavailable; verify successful Chat completion remains usable in both cases and Stats shows populated versus unavailable states appropriately on desktop and mobile.
- [x] 7.3 Submit one controlled valid sample to the dedicated project and attempt invalid duration, unsupported model, raw-table read, and raw-table update operations as the public role; verify row-removal privilege is absent without issuing destructive SQL, only the valid aggregate changes, no event row exists, invalid/unauthorized operations fail, and the RPC reports one sample averaging 1,500 ms.
- [x] 7.4 Inspect the final diff, generated bundle, test output, MCP configuration, environment handling, and `git status` for credential or PII leakage; verify no secret, OAuth token, database password, raw prompt/response, identifier, timestamp, or unrelated working-tree change is included before reporting the change ready.
