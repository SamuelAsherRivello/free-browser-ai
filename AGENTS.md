# AI Repository Guidance

## Template use workflow

If user directs you to use this template, then follow these steps:

1. Determine the reuse mode from the request. For a new GitHub repository,
   use GitHub's **Use this template** flow when authorized. For a local project,
   create an authorized copy in its explicitly named destination. When the user
   says to use this repository only as inspiration, inspect it as a reference
   and copy no files unless they request that.
2. Read this file before adding a stack or changing project files.
3. Confirm the project's purpose, target platforms, selected stack, deployment
   target, dependency policy, and whether an OpenSpec workflow is required. Ask
   only for an input that is material and not provided or discoverable.
4. Keep `free-browser-ai/` as the Vite application root and keep the GitHub
   repository URL synchronized with the project repository. The repository root
   remains the npm project root.
5. Inspect the resulting project's actual configuration before documenting or
   running setup, test, build, deployment, or release commands. Complete the
   checklist's delivery gate before presenting the project as ready.

## HTML template corner roles

The default HTML template uses four reusable `corner` instances inside
`ui_layer`. Preserve these roles when adapting the template:

- Upper left: project title.
- Upper right: project links.
- Lower right: project version.
- Lower left: project settings.

## Pull request workflow

- Do not create pull requests for any workflow unless the user explicitly asks
  for a pull request in the current request.
- Pushing a branch, committing changes, or completing an OpenSpec/template
  workflow is not implicit approval to open a pull request.

## OpenSpec change selection

- OpenSpec's current change is session-local. Infer it from this OpenCode
  instance's conversation only; never read or write a shared project file for
  this purpose.
- After creating, selecting, or explicitly switching a change, retain its name
  as the current change for the rest of this conversation.
- When an OpenSpec operation omits a change name, use that session's current
  change. Ask only when this conversation has no current change or the user
  explicitly requests a different one.

## Working directories

- **Repository root** is the npm project root. It contains `.git`, repository
  metadata, and package configuration. Project documentation assets live in
   `free-browser-ai/documentation/`. Run Git,
  dependency, build, test, and run commands there.
- **Application root** is `free-browser-ai/`. It contains the Vite entry page,
  source, tests, assets, and build output. Keep application implementation
  there unless the selected stack deliberately changes the layout.

Correct: run `git status`, dependency, build, test, and run commands from the
repository root; keep the application's source and tests under `free-browser-ai/`.

## Agent execution discipline

- Time-box investigation to the minimum needed to identify an actionable fix.
  Apply the fix or report a concrete blocker; never leave a task in passive
  investigation while the user waits.
- Use browser automation only to reproduce a specific behavior, and immediately
  convert the result into a code change or a concise finding.
