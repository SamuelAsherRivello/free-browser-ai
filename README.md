<!-- AI: Keep commands rooted at the repository. The Vite application, source, tests, and build output belong in free-browser-ai/. -->
# Free Browser AI

A privacy-first browser chat workspace for comparing Transformers.js and WebLLM. Conversations, inference, and settings stay on the device. Successful responses can contribute three fields—provider, model, and elapsed duration—to aggregate-only community timing statistics; no visitor account or private API key is required.

## Screenshot

![Free Browser AI](free-browser-ai/documentation/screenshot01.png)

## Live Demo

- [Free Browser AI](https://samuelasherrivello.github.io/free-browser-ai/)

## Table of Contents

1. [Screenshot](#screenshot)
2. [Live Demo](#live-demo)
3. [Getting Started](#getting-started)
4. [Project Details](#project-details)
5. [Privacy and Response Statistics](#privacy-and-response-statistics)
6. [Credits](#credits)

## Getting Started

Requires Node.js 24 and npm.

### 🛠 Build Project

1. From the repository root, run `npm ci`.
2. Copy `.env.example` to `.env.local` only when connecting a Supabase project, then enter its public project URL and publishable key directly in that ignored file. Never use a service-role key in the browser app.
3. Run `npm run build`. The app still builds and Chat remains usable when the optional Stats configuration is absent.
4. Run `npx playwright install chromium` before generating screenshots locally.

### 🛠 Run Project

1. From the repository root, run `npm run dev` and open the localhost URL Vite prints.
2. Run `npm test` to execute the focused source checks.
3. Run `npm run capture:screenshot` after a production build to refresh the README screenshot.

### 🛠 Release Version

1. Run `npm test` and `npm run build` from the repository root.
2. Push to `main` to deploy through the GitHub Pages workflow.
3. Run the **Release** workflow from GitHub Actions to capture a current screenshot, bump the patch version, tag it, and create the GitHub release.

## Project Details

The application is a Vite-powered React single-page app. The repository root holds package configuration and workflows; `free-browser-ai/` contains the browser entry point, components, styles, tests, build output, and documentation assets.

### 📝 Structure

- `free-browser-ai/index.html` provides the browser application shell.
- `free-browser-ai/test/` contains focused automated checks.
- `free-browser-ai/documentation/` contains canonical README images and project
  documentation assets.

### 📦 AI

- `AGENTS.md` contains repository-specific AI agent guidance.
- [OpenCode](.opencode/) contains additional agent guidance.
- [openspec](openspec/) contains the repository's specification workflow
  configuration.

### 📦 Packages

- [Vite](https://vite.dev/) provides local development and production builds.
- [Transformers.js](https://huggingface.co/docs/transformers.js/) provides the ONNX/WASM local inference path.
- [WebLLM](https://webllm.mlc.ai/) provides the WebGPU local inference path.
- [Supabase](https://supabase.com/) stores only aggregate response counts and cumulative timing totals behind two narrowly scoped public RPCs.

### 📦 Runtime Notes

- Conversations and settings persist only in browser local storage. Reset clears app-managed data and refreshes the page; downloaded model caches can remain.
- WebLLM requires a WebGPU-capable browser. Transformers.js remains separately available without WebGPU.
- The selected models, public sources, licenses, browser requirements, and dependency-audit limitation are documented in [the runtime matrix](free-browser-ai/documentation/runtime-matrix.md).

## Privacy and Response Statistics

The Stats tab shows the average completed assistant response time overall and by provider/model. Timing begins when an accepted chat request starts and is submitted only after the full assistant response completes. Failed and stopped attempts are not counted.

Each successful measurement sends only:

- Provider ID.
- Model ID.
- Rounded elapsed duration in milliseconds.

Prompts, responses, identities, account data, device identifiers, IP addresses, user agents, application timestamps, and individual measurement rows are not stored by the application data model. The database updates one aggregate counter and cumulative duration per supported provider/model pair; public reads return only counts and calculated averages. The browser uses a publishable Supabase key with direct table access revoked and can call only the two intended RPCs. Telemetry failure is discarded without a retry queue and never blocks Chat.

These public, anonymous community measurements are unverified and are not benchmark-grade; a public client can submit fabricated values. The project deliberately favors collecting less data over identifying or tracking visitors.

For GitHub Pages, configure `VITE_SUPABASE_URL` as a repository/environment variable and `VITE_SUPABASE_PUBLISHABLE_KEY` as a protected secret. The workflows inject them only while building. Do not commit `.env.local`, database passwords, service-role keys, or OAuth credentials.


## Credits

<!-- AI: Preserve established attribution and ownership. Customize the following subsections only from confirmed contributor, contact, and license information; do not infer a new owner from the repository name. -->
### 💡 Contributors

<!-- AI: Preserve existing contributor credit and add contributors only when confirmed. Do not automatically advance experience counts or their reference year. -->
- Samuel Asher Rivello - Over 25 years of game development XP (2026)

### 💡 Contact

<!-- AI: Preserve confirmed contact destinations and their order unless requested otherwise. Use readable display URLs without a protocol or trailing slash while keeping the real link target intact. Do not invent accounts or change target capitalization based on display styling. -->
- [LinkedIn.com/in/SamuelAsherRivello](https://Linkedin.com/in/SamuelAsherRivello) ⭐ 
- [GitHub.com/SamuelAsherRivello](https://github.com/SamuelAsherRivello/)
- [Twitter.com/srivello](https://twitter.com/srivello/)
- Resume / Portfolio: [SamuelAsherRivello.com](http://www.SamuelAsherRivello.com)


### 💡 License

<!-- AI: Keep the license name linked to the actual relative license file and verify that its terms match this statement. Keep the copyright holder and year consistent with that file. Do not change license terms, ownership, or dates without an explicit request. -->
- Provided as-is under the [MIT License](LICENSE).

- Copyright © 2026 Rivello Multimedia Consulting, LLC.
