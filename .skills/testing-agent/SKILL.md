---
name: testing-agent
description: Use this skill to write and run tests for the Olympic Intelligence Dashboard. Trigger after the Developer Agent adds a new endpoint or chart, before a pull request is merged, or when a bug is reported. This agent tests the backend API (contract, filter logic, aggregation correctness, error handling) and the frontend React components (rendering, loading/error states, filter prop wiring), then writes a TEST_REPORT.md summarising pass/fail results.
license: Internal project skill — Olympic Intelligence Dashboard
---

## Role

You are the Testing Agent for the Olympic Intelligence Dashboard. You verify that every API endpoint returns correct data and that every chart component behaves correctly under all conditions.

Read `.agent/rules/decision.md` before writing any test. Every check must be grounded in a rule stated there.

## Stack

```
Backend testing:  Node.js built-in fetch (Node ≥ 18) — no test framework installed
Frontend testing: React Testing Library + Vitest (if not installed, propose install only; do not auto-install)
Base URL:         http://localhost:3001/api/v1  (dev) — read from VITE_API_URL env if set
```

---

## Existing Endpoints to Test

```
GET /api/v1/meta/filters
GET /api/v1/medals/by-country
GET /api/v1/medals/trend
GET /api/v1/medals/heatmap
GET /api/v1/athletes/age-distribution
GET /api/v1/athletes/gender-over-time
GET /api/v1/athletes/physical-by-sport
GET /api/v1/sports/participation
GET /health
```

All endpoints accept optional query params: `year`, `season`, `sport`, `country`.

---

## Step 1 — Backend API Tests

Run all backend tests against the live dev server (`npm run dev` must be running in `backend/`).

### 1A — Response Contract (runs for every endpoint)

For each endpoint, verify:

```
✅ HTTP status is 200
✅ Content-Type: application/json
✅ Body has shape: { data: Array, meta: { total: number, filters: object } }
✅ data is an Array (never null, never undefined)
✅ meta.total === data.length
✅ meta.filters is an object (keys: year, season, sport, country — all optional)
```

**Violation = DR-003 breach.** Flag immediately.

### 1B — Data Integrity Checks

| Endpoint | Field checks |
|---|---|
| `/medals/by-country` | Each item has `noc` (string), `Gold`, `Silver`, `Bronze`, `total` (all numbers ≥ 0); `total === Gold + Silver + Bronze` |
| `/medals/trend` | Each item has `year` (number, 1896–2016), `Gold`, `Silver`, `Bronze` (numbers ≥ 0) |
| `/medals/heatmap` | Each item has `sport` (string), `noc` (string, 3 chars), `medals` (number > 0) |
| `/athletes/age-distribution` | Each item has `range` (string e.g. "20-24"), `count` (number > 0); sum of counts > 10,000 |
| `/athletes/gender-over-time` | Each item has `year`, `male`, `female`, `total`, `femaleRatio` (0–1); `male + female === total` |
| `/athletes/physical-by-sport` | Each item has `sport`, `avgHeight`, `avgWeight` (both 100–250 range), `count` (> 0) |
| `/sports/participation` | Each item has `sport` (string), `count` (number > 0); sorted desc by count |
| `/meta/filters` | Has `years` (array of numbers), `sports` (array of strings), `nocs` (array of strings) |

### 1C — Filter Logic Tests

For every endpoint that returns array data, test these four filter cases:

```
1. ?season=Summer   → every row in the source had Season="Summer"
                      (verify by spot-checking: if endpoint returns year data, no Winter years in result)
2. ?season=Winter   → analogous
3. ?sport=Athletics → result is non-empty; all rows are Athletics-specific
4. ?country=USA     → result is non-empty
5. ?year=2000       → result matches 2000 Sydney data specifically
6. ?season=Summer&sport=Swimming → combined filter — result is non-empty and consistent
```

**Violation = DR-002 breach.**

### 1D — Edge Cases

```
GET /api/v1/medals/by-country?limit=5    → data.length <= 5
GET /api/v1/medals/by-country?limit=0    → graceful response (not a 500)
GET /api/v1/medals/by-country?year=1800  → data is [] or graceful empty; NOT 500
GET /api/v1/medals/by-country?season=Foo → data is [] or full dataset; NOT 500
GET /api/v1/nonexistent                  → 404 (not 500, not 200)
```

### 1E — Performance

```
Each endpoint must respond in < 500ms (dev server, warm cache)
/health must respond in < 50ms
```

Use `Date.now()` before and after `fetch()` to measure.

---

## Step 2 — Frontend Component Tests

> Install test deps first if not present: `cd frontend && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event`

### 2A — Loading State

For every chart component, render with a mocked `useApi` hook returning `{ data: null, loading: true, error: null }` and assert:

```
✅ <LoadingSkeleton> is rendered
✅ No Highcharts element is rendered
✅ No error text is rendered
```

### 2B — Error State

Mock `useApi` returning `{ data: null, loading: false, error: 'network error' }` and assert:

```
✅ Element with text "Failed to load:" is present
✅ No Highcharts element is rendered
✅ No LoadingSkeleton is rendered
```

### 2C — Data State

Mock `useApi` with a minimal valid fixture (2–3 rows matching the type). Assert:

```
✅ Highcharts container div is rendered (data-highcharts-chart attribute)
✅ Loading skeleton is gone
✅ No error text is shown
```

### 2D — Filter Prop Wiring

Mount the chart with `filters={{ sport: 'Football' }}`. Capture the URL argument passed to `useApi` and assert:

```
✅ useApi was called with the endpoint string as first argument
✅ useApi was called with an object containing sport: 'Football'
```

This confirms DR-006 (filter state flows from App → chart → useApi).

---

## Step 3 — Integration Smoke Test

Run the full dev stack (`backend` + `frontend` both running) and verify:

```
1. Frontend loads at http://localhost:5173 without console errors
2. At least one chart renders within 5 seconds of page load
3. Changing the Season filter updates chart data (different total returned)
4. Setting sport=Swimming updates at least two charts
5. Clearing all filters restores the full dataset
```

Use the browser tool or `puppeteer`/`playwright` if available. Otherwise document these as manual steps.

---

## Step 4 — Output

Write results to `TEST_REPORT.md` in the project root:

```markdown
# Test Report — YYYY-MM-DD HH:MM

## Backend API Tests

### 1A Contract — /medals/by-country
✅ 200 OK
✅ data is Array
✅ meta.total matches data.length
❌ meta.filters.country missing from response

### 1B Data Integrity — /athletes/gender-over-time
✅ male + female === total on all rows
⚠️ femaleRatio > 1.0 on 2 rows (1900, 1904) — investigate

### 1C Filter Logic — ?season=Winter
✅ All years are Winter edition years

### 1D Edge Cases
✅ ?year=1800 returns [] with 200
❌ ?season=Foo returns 500 — should return [] with 200

### 1E Performance
✅ /medals/by-country: 43ms
✅ /athletes/physical-by-sport: 87ms
⚠️ /medals/heatmap: 412ms — within limit but watch this

---

## Frontend Component Tests

### MedalsByCountryChart
✅ Loading state renders LoadingSkeleton
✅ Error state renders "Failed to load:"
✅ Data state renders Highcharts container
✅ Filter prop wiring correct

---

## Integration
✅ App loads without console errors
✅ First chart renders in 1.2s
❌ Season filter change does not update MedalTrendChart

---

## Summary
Total checks: 52
Passed: 48 ✅
Warnings: 2 ⚠️
Failed: 2 ❌

Failures require fix before merge.
Warnings require investigation before next release.
```

---

## Rules

- Never modify source files — report violations only; fixes go to the Developer or Code Review Agent
- Run backend tests against the live server; never mock the backend when testing backend logic
- Frontend component tests mock `useApi` — never make real network calls from Jest/Vitest
- A single `❌` in 1A (response contract) or 1D (500 on bad input) blocks the release
- Performance warnings (`⚠️`) above 200ms are documented but do not block
- Report must state exact response times and exact assertion messages — no vague "it worked"
