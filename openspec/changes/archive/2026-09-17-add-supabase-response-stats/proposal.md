## Why

Free Browser AI currently helps visitors compare local provider/model combinations, but it offers no shared evidence about how long completed assistant responses take. A privacy-minimized public Stats view can make those comparisons useful without sending prompts, responses, identities, or device-level data off the visitor's device.

## What Changes

- Add a top-level `Stats` tab that shows the overall average assistant response time and a provider/model table containing response count and average response time.
- Measure user-perceived response duration from accepted prompt submission until the full successful response completes, and exclude stopped or failed attempts.
- Send one best-effort anonymous metric per successful response to a dedicated Supabase project; telemetry failure must never block or alter local chat.
- Immediately fold each validated duration into aggregate provider/model counters instead of retaining individual response events. Store only provider, model, response count, and cumulative duration. Do not store raw per-response durations, prompts, responses, user/session/chat/message identifiers, IP addresses, user agents, device data, application timestamps, or other personally identifiable or linkable application data.
- Expose only calculated aggregate statistics to public clients and keep the underlying aggregate state unavailable for direct public reads, updates, and deletes.
- Add a clear privacy disclosure explaining what is sent and that conversations and inference remain local.
- Add a safe, project-scoped Supabase MCP setup and an explicit operator authentication handoff. The user authenticates directly with Supabase in the browser and approves any organization, region, and cost decision; no credential is pasted into chat or committed. After that handoff, project creation, database setup, application integration, and verification can proceed autonomously within the approved scope.
- Preserve the existing static GitHub Pages deployment by injecting only the Supabase project URL and browser-safe publishable key at build time. No Supabase secret or service-role credential enters the browser bundle, repository, logs, screenshots, or planning artifacts.

Acceptance requires that successful responses contribute directly to anonymous aggregates without creating raw event rows, aggregate statistics render accessibly on narrow and wide viewports, invalid or unauthorized database operations are denied, telemetry outages do not affect chat, and automated checks verify both the privacy boundary and the published configuration path.

## Capabilities

### New Capabilities

- `anonymous-response-stats`: Privacy-minimized collection of successful assistant response durations and public aggregate statistics grouped by provider and model.

### Modified Capabilities

- `browser-ai-chat`: Add Stats to the top-level static workspace navigation while preserving local inference, local conversation content, responsive behavior, and chat availability when telemetry is unavailable.

## Impact

- Application: `free-browser-ai/src/App.jsx`, view restoration, responsive styles, a Supabase metrics client, and focused unit/browser tests.
- Database: a dedicated Supabase project with a non-public provider/model aggregate table, narrowly granted submission/read functions, input validation, and database permission tests.
- Dependencies and configuration: Supabase browser client support, ignored local environment configuration, project-scoped Codex MCP configuration, and GitHub Pages build variables for the public project URL and publishable key.
- Documentation: README/runtime privacy language and setup guidance must distinguish local conversation data from anonymous timing telemetry.
- Existing uncommitted application and test edits are outside this change and must be preserved during implementation.
