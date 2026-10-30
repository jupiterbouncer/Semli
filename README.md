# Semli

**A personal academic companion for students using Canvas LMS.** Semli is designed to make academic patterns easier to understand and connect them to useful next steps, without diagnosing wellbeing or turning student activity into a high-stakes score.

> **Current status:** Early prototype. The runnable Vite/React experience uses synthetic sample data. It does not connect to Canvas, retrieve real student records, persist user accounts, or call a live AI service.

## Current prototype

The frontend currently includes:

- **Home:** Sample weekly rhythm, expandable academic-context indicators, and illustrative recommendations.
- **My patterns:** Sample submission-pattern visualization and explanatory context.
- **Discover:** Example academic, wellbeing, and activity resources. Links are placeholders, not verified university services.
- **Settings:** Prototype-only Canvas connection and privacy information.
- **About:** Product purpose, design principles, boundaries, and current prototype status.

The interface is intentionally explicit about sample data. It does not diagnose burnout, use grades to calculate personal indicators, or expose real student information.

## Repository structure

```text
src/
  analyzer/       Rule-based academic-pattern analysis modules
  canvas/         Synthetic Canvas data provider
  components/     Shared React UI components
  data/           Synthetic dashboard and resource data
  pages/          Home-linked pages, including About
  recommender/    Resource catalogue, recommendation validation,
                  caching, feedback, and AI-provider scaffolding
  server/         In-progress Express route and handler scaffolding
  App.jsx         Hash-based page navigation
  main.jsx        React application entry point
  styles.css      Shared visual system
  about.css       About-page styles
test/             Analyzer, recommender, and server test files
```

The analyzer, recommender, synthetic provider, and server files are in-progress scaffolding. They are not yet connected to the frontend as a live student application. The server currently uses a synthetic data provider and a stub recommendation generator; it does not make Canvas or AI-provider requests.

## Run the frontend locally

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Vite serves the frontend locally. The root package scripts currently provide `dev`, `build`, and `preview` commands.

## Current implementation boundaries

- No Canvas OAuth flow, token storage, or live Canvas synchronization.
- No Supabase/PostgreSQL persistence or production authentication.
- No live AI API integration. Recommendation modules include provider scaffolding and validation, but the runnable server uses a stub generator.
- No browser extension or floating Canvas companion yet.
- No institutional/advisor mode.
- No burnout diagnosis or validated burnout prediction model.

## Planned product direction

The intended personal-mode product will use student-authorized Canvas OAuth, transparent rule-based academic indicators, and AI-assisted recommendations grounded in a verified resource catalogue. Any future predictive model would require suitable, ethically collected data and independent evaluation. Institutional workflows would require separate university approval and access controls.

The planned deployment architecture is a React frontend, Node.js/Express API, Supabase PostgreSQL and authentication, Canvas OAuth 2.0, and an external AI API. Deployment targets are Cloudflare Pages for the frontend and Render for the API. These services are not configured in this repository yet.

## Tests and backend setup

Test files are present under `test/`, but the root `package.json` does not currently define a test script or install the test/server dependencies. Before running the backend or tests from the repository root, configure the module system consistently and add the required dependencies and scripts. The root package is currently an ES module project, while the server scaffolding uses CommonJS `require`.

## Product principles

- **Personal first:** Students control their connection, preferences, and personal view.
- **Explainable:** Indicators show the observations behind them.
- **Non-diagnostic:** Academic activity is context, not a mental-health assessment.
- **Privacy-conscious:** Use only permitted, necessary information and keep personal insights private by default.
- **Human-centred:** Suggestions support student choice; they do not make academic or clinical decisions.
