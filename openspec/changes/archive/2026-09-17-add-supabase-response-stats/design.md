## Context

See `proposal.md` for motivation and scope. The application is a React 19/Vite 8 static site deployed to GitHub Pages from `free-browser-ai/`. Local inference streams through provider adapters in `App.jsx`; the accepted prompt and successful `await task` boundary are already available in the send flow. Conversation content and configuration currently persist only in browser local storage.

There is no application backend, Supabase dependency, project-scoped Codex MCP configuration, or Vite environment example. The Pages workflow builds on `main` without injected application variables. Existing uncommitted scroll-following edits in `App.jsx` and their test change are unrelated and must be preserved.

This change crosses browser UI, deployment configuration, a new external database, and database authorization. The requirements are defined in `specs/anonymous-response-stats/spec.md` and the `browser-ai-chat` delta.

## Goals / Non-Goals

**Goals:**

- Preserve local inference and conversation privacy while collecting the minimum useful shared timing aggregate.
- Make telemetry optional, non-blocking, and unable to break chat.
- Use a reproducible database migration with a narrow unauthenticated interface and no browser-held elevated credential.
- Give the user a short, explicit OAuth handoff, then let implementation and verification continue autonomously within the approved project.
- Keep the final MCP connection restricted to the dedicated Supabase project and the smallest useful tool groups.

**Non-Goals:**

- Storing individual response events, time-to-first-token, tokens per second, prompts, responses, errors, browser details, geography, timestamps, or visitor identifiers.
- Authenticating application visitors or creating user profiles.
- Producing a rigorous or tamper-proof benchmark. Anonymous public submissions can be fabricated, so the display represents unverified community measurements.
- Adding an Edge Function, CAPTCHA, IP-based rate limit, offline telemetry queue, or retry persistence. Each would add processing, identifiers, third parties, or operational complexity beyond the privacy-minimized goal.
- Replacing the current static GitHub Pages deployment or moving inference off-device.

## Decisions

### 1. Aggregate immediately; never store an event row

Create a non-exposed `private.response_stats` table with one row per supported provider/model pair:

- `provider` text
- `model` text
- `response_count` bigint
- `total_duration_ms` bigint
- primary key on `(provider, model)`

The table is seeded from the four provider/model pairs currently declared in `catalog.js`. It has no event identifier, raw duration column, timestamp, user field, or device field. A successful submission atomically increments `response_count` and `total_duration_ms` for an existing pair.

This is safer than an append-only measurements table because an individual response cannot be reconstructed or correlated later. The trade-off is that erroneous or malicious submissions cannot be isolated and removed. That is acceptable for explicitly unverified public statistics and preferable to retaining linkable events.

Alternatives considered:

- Store one row per response: rejected because it retains more detail than the UI needs.
- Store daily aggregates: rejected because the date dimension is unnecessary and creates a correlation surface.
- Store metrics locally only: rejected because visitors could not see shared statistics.

### 2. Expose two narrow security-definer RPCs, not table access

Use schema-qualified Postgres functions with an empty fixed `search_path`:

- `public.record_response_metric(provider, model, duration_ms)` validates an integer duration from 1 through 3,600,000 milliseconds and updates only a pre-seeded supported pair.
- `public.get_response_stats()` returns a JSON result containing overall successful response count and average duration plus provider/model rows containing count and average duration. It does not return cumulative totals or underlying table rows.

Revoke all direct privileges on the private table from public client roles. Enable row-level security with no public policies as defense in depth. Revoke default function execution and grant `EXECUTE` only on the two exact signatures to `anon`; the app does not use Supabase Auth. No public update, delete, or generic SQL path is granted.

The submission function performs a single atomic update and raises on invalid input. Extra RPC arguments fail function resolution and are not stored. Supported model changes require a database migration alongside a catalog change so arbitrary model strings cannot pollute the table.

Alternatives considered:

- Direct browser inserts with RLS: rejected because a narrow function offers a smaller surface and direct table grants are unnecessary.
- A public view: rejected because function output can omit cumulative totals and avoids view-owner/RLS ambiguity.
- A Supabase Edge Function: rejected for this slice because it does not make anonymous browser data trustworthy without another identity or challenge mechanism.

### 3. Measure user-perceived successful completion with a monotonic clock

Capture `performance.now()` after prompt validation and immediately before the accepted attempt changes to loading. After the generation task resolves successfully, calculate and round the elapsed milliseconds, then fire the metric submission without awaiting it. Preparation or re-preparation time is included when the user actually waits for it.

Failed and stopped attempts do not call the submission path. A successful retry starts a fresh timer and contributes once. The existing wall-clock `Date.now()` fields used for visual progress remain separate and are never sent.

The metric client has no queue and no persistent retry. A failed request is discarded, which favors privacy and chat reliability over collection completeness.

Alternatives considered:

- Generation-only timing: rejected because it omits waiting the visitor experiences.
- First-token latency: rejected because the request asks for full response time and storing another metric is unnecessary.

### 4. Keep Supabase behind a small application adapter

Add `@supabase/supabase-js` and isolate configuration, `recordResponseMetric`, and `getResponseStats` in a small module under `free-browser-ai/src/`. The module creates a client only when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` exist. It exports safe unavailable results when configuration is absent and never logs payloads or credentials.

`App.jsx` owns the accepted/completed timing boundary and calls the adapter. A Stats component fetches on entry and renders loading, empty, unavailable, and populated states. The overall value comes from the server-produced aggregate response, not from raw events. A submission failure stays outside conversation error state.

Stats becomes a fourth top-level view. `state.js` recognizes `stats` when restoring the selected view. Responsive navigation changes from three to four mobile columns, while the Stats panel follows the single-document-scroll behavior used by informational views.

Alternatives considered:

- Put Supabase calls directly in `App.jsx`: rejected because configuration, transport errors, and test seams should remain separate from chat state.
- Poll continuously or use Realtime: rejected because fetch-on-entry is sufficient and creates less network activity.

### 5. Treat the publishable key as public but keep it out of source control

Only the project URL and Supabase publishable key enter the Vite bundle. No secret key, service-role key, database password, OAuth token, or personal access token is used by browser code.

The local checkout stays unconfigured by default and no key-bearing `.env.local` is persisted. A committed `.env.example` contains names and placeholders only for developers who deliberately opt into local Supabase testing. The GitHub Pages environment supplies the URL and publishable key to the build, with the publishable key stored in GitHub's protected configuration even though it is intentionally visible in the compiled browser application. Documentation must say that authorization comes from grants and database functions, not from hiding the publishable key.

### 6. Use a two-stage, project-scoped MCP authentication handoff

The final repository configuration is `.codex/config.toml` with a Streamable HTTP `supabase` server scoped by `project_ref`, restricted to database, development, and debugging feature groups, and configured to prompt for write-capable tools. It contains no credential. OAuth material remains in Codex's credential storage.

Project creation requires account tools before a project reference exists. Implementation therefore uses this handoff:

1. Codex adds a temporary project-local Supabase MCP entry limited to the account tools needed to list organizations, inspect/confirm cost, create the project, and retrieve it.
2. Codex asks the user to restart/reload the Codex client if requested, open **Settings -> MCP servers -> supabase**, select **Authenticate**, and complete the Supabase sign-in and organization grant in the browser. The CLI equivalent is `codex mcp login supabase`.
3. The user enters any requested password or credential only in Supabase's browser UI and returns with the words `authenticated`; the user never pastes a token, password, or key into chat.
4. Codex verifies tool access. If there is exactly one organization and project creation has zero incremental cost, Codex creates `free-browser-ai-stats` in Supabase's recommended available region and proceeds. If there are multiple organizations, a non-zero cost, or a required secret-entry step, Codex pauses once with the exact choice or cost for the user; it does not guess or expose a secret.
5. Immediately after project creation, Codex replaces the temporary account-scoped entry with the final `project_ref`-scoped configuration and removes account/function/branching/storage capabilities. The user may need one final Codex reload; existing OAuth authorization is reused where supported.
6. Codex then applies the reviewed migration, obtains only the project URL and publishable key, integrates the app, configures deployment values, and performs database/application verification. Write approvals remain enabled so the user can review the exact dedicated-project migration if the client requires approval, but no further product decision is expected.

This sequence preserves autonomy after authentication without leaving an all-project MCP connection in the repository. During implementation, Codex's hosted-MCP dynamic client registration failed before the browser authorization step with upstream Codex issue #20503. The repository therefore retains the credential-free project-scoped server definition, the official Supabase plugin connection is offered as the supported authentication path, and the authenticated Supabase dashboard is the non-secret-bearing fallback for project creation, migration, and advisor checks. No access token is written to the project.

### 7. Make the database and deployment reproducible

Add a Supabase migration and database authorization tests under a conventional `supabase/` directory. Tests assert the exact aggregate columns, absence of event columns/tables, supported-pair validation, duration validation, atomic count/total increments, aggregate-only output, and denied direct access for `anon`.

Update the GitHub Pages workflow to inject the two public Vite values only during the build. Unit tests mock the metrics adapter and cover success, stop/failure exclusion, missing configuration, and non-blocking submission failure. Browser tests cover the fourth navigation target, Stats states, keyboard access, 44-by-44 mobile targets, and document scroll ownership. README privacy text must no longer claim that all application data stays on-device without the telemetry qualification.

## Risks / Trade-offs

- **[Anonymous metrics can be forged or spammed]** -> Restrict inputs to seeded provider/model pairs and bounded durations, label results as anonymous community measurements, and avoid claiming benchmark-grade accuracy. Do not collect identity merely to improve trustworthiness.
- **[Aggregate counters cannot be surgically corrected]** -> Favor privacy over event retention. If corruption becomes material, disable submission and start a new aggregate version through a future approved migration rather than retaining raw history now.
- **[Public RPC may incur usage cost]** -> Fetch only when Stats is opened, avoid polling/Realtime, and confirm project cost before creation.
- **[Telemetry wording could undermine the local-first promise]** -> Disclose the exact three submitted inputs and clarify that inference, prompts, responses, and conversation state remain local.
- **[MCP account scope is broad during bootstrap]** -> Tool-allowlist the temporary connection, keep write approval prompts, create a dedicated project, then immediately replace it with a `project_ref`-scoped connection.
- **[Build configuration can be absent or incorrect]** -> Treat analytics as unavailable, keep chat operational, show a Stats unavailable state, and verify the deployed build without printing configuration values.
- **[Catalog and database allowlists can drift]** -> Treat a provider/model catalog change as requiring a matching aggregate seed migration and a contract test.

## Migration Plan

1. Complete the MCP OAuth handoff above and create the dedicated project only after cost and organization conditions are satisfied.
2. Replace the temporary MCP configuration with the final project-scoped configuration before applying schema work.
3. Add and apply the non-destructive migration that creates the private aggregate state, seeds supported pairs, creates the two RPCs, and grants only their intended execution paths.
4. Run database privilege and behavior checks, then review Supabase security and performance advisors. Resolve relevant findings before application integration.
5. Add the browser adapter, Stats UI, timing hook, responsive behavior, tests, and documentation while preserving unrelated working-tree edits.
6. Configure local ignored values and GitHub Pages protected build values without printing them. Run unit, responsive browser, build, and production-preview checks.
7. Deploy and verify that chat still works when analytics is reachable and when requests are deliberately blocked, then verify populated Stats against controlled test submissions.

Rollback is non-destructive: remove the two public build values to disable browser calls, hide/disable Stats if necessary, and revoke `anon` execution on the submission RPC. Retain the aggregate table and migration history for auditability; do not drop data or rewrite migration history.
