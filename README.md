# Semli

A student-centered academic companion for Canvas, providing explainable
workload insights and personalized learning and support recommendations.

This repository has two independently deployable halves.

## `frontend/` — dashboard prototype

Renders synthetic sample data. Makes no Canvas request, account
connection, AI request, or wellbeing assessment.

**Milestone scope:**

1. Responsive dashboard visual system and accessible layout.
2. Weekly workload rhythm rendered from local mock data.
3. Individual academic-context indicators, explained in expandable,
   keyboard-accessible panels.
4. Clearly-labelled example academic and optional-support recommendations.
5. Responsive, hash-based navigation for Home, My Patterns, Discover,
   and Settings.
6. Prototype-only patterns, resource, and privacy-settings interactions
   without real account or Canvas behavior.

**Component hierarchy:** `App` → `Sidebar` and page views (`HomePage`,
`PatternsPage`, `DiscoverPage`, `SettingsPage`). Shared components include
`PageHeader`, `CategoryTabs`, `WeeklyRhythm`, `IndicatorAccordion`,
`SubmissionChart`, `Recommendations`, `SettingsRow`, `Avatar`, and `Icon`.

`My Semli` is intentionally marked as a future milestone rather than
rendered as an inactive account feature.

**Run locally:**

```
cd frontend
npm install
npm run dev
```

## `backend/` — analyzer, recommender, and API layer

Three modules, kept distinct per the project brief even though they
deploy together:

- **`src/analyzer/`** (Component A) — rule-based academic-pattern analyzer.
  Deadline pressure, submission rhythm, course activity trend, and a
  combined weekly pulse summary. No ML, no training data — deterministic
  and explainable by construction.
- **`src/recommender/`** (Component C) — RAG-based recommendation engine.
  Context → catalogue retrieval → AI selection → validation against what
  was actually retrieved → cache. Includes per-user/aggregate AI usage
  budgets enforced before any call, and a feedback store.
- **`src/canvas/`** — a synthetic data provider standing in for the real
  Canvas OAuth connector (Stage 3, not yet built — gated on institutional
  API access). Implements the same interface a real provider will later
  use, so swapping it in later doesn't touch `analyzer/` or `server/`.
- **`src/server/`** — the Express API layer joining the above. Request
  logic lives in framework-independent `handlers.js`; `app.js` is a thin
  HTTP binding on top of it.

**Run locally:**

```
cd backend
npm install
npm start      # serves the API on port 3000 by default
npm test       # runs the Jest suite
```

**Deferred, across both halves:** real Canvas OAuth and sync, a real AI
provider (currently stubbed), persisted preferences, the browser
extension companion, and any institutional workflows.

## Key product and technical risks

- Canvas endpoints and permissions vary by institution; activity
  information may not be available or reliable.
- A personal baseline and the wording/thresholds for transparent
  indicators need validation with synthetic and authorized data.
- Production recommendations must be linked to a maintained, verified
  resource catalogue — the current catalogue is a small seed set for
  development, not a live service directory.
- OAuth tokens and identifiable academic records require server-side
  handling and governance; none of that belongs in the frontend.
