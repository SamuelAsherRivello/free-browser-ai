## Context

The repository root is the npm project root, while application code, tests, build output, and canonical documentation assets already have defined locations under `free-browser-ai/`. Browser automation has instead emitted tracked review captures into the root. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Establish one ignored, repository-root destination for transient tool output.
- Make the distinction between temporary output and canonical documentation assets explicit to future agents.
- Remove only identified generated review artifacts and the unused seed test.

**Non-Goals:**
- Moving or deleting canonical `free-browser-ai/documentation/` assets.
- Changing application build output, runtime behavior, test behavior, or OpenSpec artifacts.
- Adding an artifact-retention or automated-cleanup service.

## Decisions

### Use a root-level ignored output directory

Create `output/` as the common target for screenshots, browser snapshots, and similar temporary files. It is adjacent to the repository-level commands that generate it and avoids placing generated output in the Vite application or canonical documentation trees. Ignore `output/` as a directory rather than adding filename-specific patterns, so new capture names remain untracked automatically.

### Preserve canonical documentation assets in place

Keep intentional documentation images under `free-browser-ai/documentation/`. Moving all images into `output/` would break README references and blur the distinction between reviewed documentation and temporary diagnostics.

### Encode the destination in repository guidance

Add an explicit `AGENTS.md` rule for transient browser and review artifacts. Git ignore rules prevent accidental staging, while guidance prevents root clutter and directs tools to a predictable location.

## Risks / Trade-offs

- [A tool does not accept an output path] -> Its generated file remains ignored only when manually moved into `output/`; update the relevant invocation where it is used.
- [A documentation asset is mistaken for temporary output] -> Limit deletion to the listed root-level artifacts and preserve `free-browser-ai/documentation/`.
- [Ignored output hides a needed review asset] -> Move deliberately approved assets into `free-browser-ai/documentation/` before referencing them in project documentation.

## Migration Plan

1. Delete the listed root-level generated captures and unused seed test.
2. Add `output/` to `.gitignore` and create the directory with a keep marker only if a tracked directory is needed.
3. Update `AGENTS.md` with the artifact-placement rule.
4. Verify the root inventory is limited to repository configuration and intentional project files, and confirm generated output is ignored.

Rollback consists of restoring a deleted file from version control and removing the ignore and guidance rules; no runtime data migration is required.
