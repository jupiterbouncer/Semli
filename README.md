# Semli dashboard milestone

This repository currently contains a frontend-only prototype. It renders synthetic sample data and makes no Canvas request, account connection, AI request, or wellbeing assessment.

## Milestone scope

1. Build the responsive dashboard visual system and accessible layout.
2. Render a weekly workload rhythm from local mock data.
3. Explain individual academic-context indicators in expandable, keyboard-accessible panels.
4. Surface clearly-labelled example academic and optional-support recommendations.

Deferred: authentication, Canvas OAuth and sync, persisted preferences, verified resource retrieval, browser extension, backend services, and any institutional workflows.

## Component hierarchy

`App` → `Sidebar`, `WeeklyRhythm`, `IndicatorAccordion` → `Indicator`, `Recommendations` → `RecommendationColumn`, and shared `Avatar` / `Icon` components.

## Key product and technical risks

- Canvas endpoints and permissions vary by institution; activity information may not be available or reliable.
- A personal baseline and the wording/thresholds for transparent indicators need validation with synthetic and authorized data.
- Production recommendations must be linked to a maintained, verified resource catalogue; this prototype does not claim its example links are live services.
- OAuth tokens and identifiable academic records require server-side handling and governance, so none belong in this initial frontend.

## Run locally

```bash
npm install
npm run dev
```
