<!-- AI: Keep commands rooted at the repository. The Vite application, source, tests, and build output belong in react-trading-simulator-runtime-agent/. -->
# React Trading Simulator Runtime Agent

An interactive React and Vite runtime shell for developing trading-simulation workflows. It includes project metadata, version display, and a fullscreen control while trading features are developed.

## Screenshot

![React Trading Simulator Runtime Agent](react-trading-simulator-runtime-agent/documentation/screenshot01.png)

## Live Demo

- [React Trading Simulator Runtime Agent](https://samuelasherrivello.github.io/react-trading-simulator-runtime-agent/)

## Table of Contents

1. [Screenshot](#screenshot)
2. [Live Demo](#live-demo)
3. [Getting Started](#getting-started)
4. [Project Details](#project-details)
5. [Credits](#credits)

## Getting Started

Requires Node.js 24 and npm.

### 🛠 Build Project

1. From the repository root, run `npm ci`.
2. Run `npm run build`.
3. Run `npx playwright install chromium` before generating screenshots locally.

### 🛠 Run Project

1. From the repository root, run `npm run dev` and open the localhost URL Vite prints.
2. Run `npm test` to execute the focused source checks.
3. Run `npm run capture:screenshot` after a production build to refresh the README screenshot.

### 🛠 Release Version

1. Run `npm test` and `npm run build` from the repository root.
2. Push to `main` to deploy through the GitHub Pages workflow.
3. Run the **Release** workflow from GitHub Actions to capture a current screenshot, bump the patch version, tag it, and create the GitHub release.

## Project Details

The application is a Vite-powered React single-page app. The repository root holds package configuration and workflows; the application directory contains the browser entry point, components, styles, tests, and documentation assets.

### 📝 Structure

- `react-trading-simulator-runtime-agent/index.html` provides the plain safe-area HTML shell.
- `react-trading-simulator-runtime-agent/test/` contains focused automated checks for the runtime shell.
- `react-trading-simulator-runtime-agent/documentation/` contains canonical README images and project
  documentation assets.

### 📦 AI

- `AGENTS.md` contains repository-specific AI agent guidance.
- [OpenCode](.opencode/) contains additional agent guidance.
- [openspec](openspec/) contains the repository's specification workflow
  configuration.

### 📦 Packages

- [Vite](https://vite.dev/) provides local development and production builds.


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
