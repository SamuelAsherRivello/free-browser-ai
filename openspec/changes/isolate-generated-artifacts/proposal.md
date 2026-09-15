## Why

Tracked browser screenshots and Playwright snapshots are accumulating at the repository root, where they obscure the actual npm project files and violate the documented application and documentation layout. Future generated review artifacts need a single ignored destination so concurrent development work does not repeat this cleanup burden.

## What Changes

- Delete the identified root-level browser-review screenshots, Playwright snapshots, and unused seed test.
- Add a repository-root `output/` directory for temporary generated artifacts and ignore its contents.
- Update repository guidance so agents write transient screenshots, browser snapshots, and similar review output to `output/`, while canonical documentation assets remain in `free-browser-ai/documentation/`.
- Preserve repository configuration, product documentation, source code, tests, OpenSpec artifacts, and intentional assets.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

- Affected files: root-level generated image/YAML artifacts, `seed.spec.ts`, `.gitignore`, and `AGENTS.md`.
- No application behavior, runtime dependency, public API, or deployed asset changes.
- Acceptance criteria: the named generated artifacts are absent from the root, `output/` is ignored, and repository guidance distinguishes temporary output from canonical documentation assets.
