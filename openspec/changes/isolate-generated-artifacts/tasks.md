## 1. Remove Root-Level Generated Artifacts

- [x] 1.1 Delete the identified root-level temporary browser screenshots and YAML snapshots; verify none of their filenames remain at the repository root.
- [x] 1.2 Delete the unused root-level `seed.spec.ts`; verify active application tests remain under `free-browser-ai/test/`.

## 2. Isolate Future Tool Output

- [x] 2.1 Add `output/` to `.gitignore` and create the directory if needed; verify a generated file inside it is ignored by Git.
- [x] 2.2 Update `AGENTS.md` with the temporary-output and canonical-documentation placement rules; verify the guidance names `output/` and `free-browser-ai/documentation/`.

## 3. Validate Repository Layout

- [x] 3.1 Review the root inventory and run `git status --short`; verify no generated review captures remain in the root and no application source or test files moved outside `free-browser-ai/`.
