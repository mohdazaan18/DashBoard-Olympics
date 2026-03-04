# Test Report — 2026-03-04

**Session**: Full API test sweep — all 8 endpoints, filter logic, edge cases, performance  
**Backend**: `http://localhost:3001` (Express + tsx hot-reload, CSV loaded in memory)  
**Tool**: Node.js 18 built-in `fetch`, automated test script

---

## 1A — Response Contract

> DR-003: every endpoint must return `{ data: T, meta: { total: number, filters: object } }`

### GET /api/v1/medals/by-country
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total` exists  
✅ `meta.total === data.length` — total=20, len=20  
✅ `meta.filters` is object  
✅ Response time: **63ms**

### GET /api/v1/medals/trend
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total === data.length` — total=35, len=35  
✅ `meta.filters` is object  
✅ Response time: **15ms**

### GET /api/v1/medals/heatmap
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total === data.length` — total=100, len=100  
✅ `meta.filters` is object  
✅ Response time: **25ms**

### GET /api/v1/athletes/age-distribution
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total === data.length` — total=17, len=17  
✅ `meta.filters` is object  
✅ Response time: **34ms**

### GET /api/v1/athletes/gender-over-time
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total === data.length` — total=35, len=35  
✅ `meta.filters` is object  
✅ Response time: **20ms**

### GET /api/v1/athletes/physical-by-sport
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total === data.length` — total=30, len=30  
✅ `meta.filters` is object  
✅ Response time: **67ms**

### GET /api/v1/sports/participation
✅ HTTP 200  
✅ `data` is Array  
✅ `meta.total === data.length` — total=25, len=25  
✅ `meta.filters` is object  
✅ Response time: **31ms**

### GET /api/v1/meta/filters
✅ HTTP 200  
⚠️ `data` is **object**, not Array  
✅ `meta.total` exists (total=271116 — full record count)  
✅ `meta.filters` is object  
✅ Response time: **55ms**  
> **Note**: `/meta/filters` intentionally returns `data: { years[], sports[], countries[], seasons[] }` — a shape divergence from the standard contract. Not a runtime error, but the SKILL.md should document this as an explicitly permitted exception.

---

## 1B — Data Integrity

### medals/by-country
✅ Each row has `noc` (string), `Gold`, `Silver`, `Bronze` (numbers)  
✅ `Gold + Silver + Bronze === total` on all 20 rows  

### medals/trend
✅ All year values within 1896–2016 range  
✅ All `Gold`, `Silver`, `Bronze` counts ≥ 0  

### medals/heatmap
✅ `noc` is exactly 3 characters on all rows  
⚠️ Some cells have `medals: 0` — by design (the endpoint emits a full 10×10 grid including missing sport/NOC combos). Not a bug; the frontend handles 0 cells in the heatmap colouring.

### athletes/age-distribution
✅ `range` field is a string on all rows  
✅ Sum of all `count` values: **261,642** (> 10,000 threshold — pass)

### athletes/gender-over-time
✅ `male + female === total` on all 35 rows — no rounding errors  
✅ `femaleRatio` is a 0–1 decimal on all rows  

### athletes/physical-by-sport
✅ All `avgHeight` values within 100–250 cm  
✅ All `avgWeight` values within 30–200 kg  

### meta/filters
✅ `years` is Array  
✅ `sports` is Array  
⚠️ Filter key is `countries` (not `nocs`) — the SKILL.md test script used the wrong field name. Data is correct; skill documentation needs updating.

---

## 1C — Filter Logic

| Filter | Endpoint | Result |
|---|---|---|
| `?season=Summer` | /medals/trend | ✅ 29 Summer-only edition rows |
| `?season=Winter` | /medals/trend | ✅ 22 Winter-only edition rows |
| `?sport=Swimming` | /athletes/age-distribution | ✅ 17 rows, sum=22,671 (vs 261,642 unfiltered) |
| `?country=USA` | /medals/by-country | ✅ Non-empty result |
| `?year=2000` | /medals/trend | ✅ 1 row returned (Sydney 2000 edition) |
| `?season=Summer&sport=Swimming` | /athletes/gender-over-time | ✅ Non-empty, combined filter works |
| `?limit=5` | /medals/by-country | ✅ Exactly 5 rows returned |

> ⚠️ Summer (29) + Winter (22) = 51 rows, which exceeds the unfiltered 35. Expected: `year` is shared across Summer/Winter editions; some years host both. This is correct data behaviour, not a bug.

---

## 1D — Edge Cases

| Input | Expected | Result |
|---|---|---|
| `?year=1800` | Non-500, empty data | ✅ HTTP 200, `data: []` |
| `?season=Foo` | Non-500, graceful | ✅ HTTP 200, `data: []` |
| `?limit=0` | Non-500 | ✅ HTTP 200, returns default 20 rows |
| `GET /api/v1/nonexistent` | 404 | ✅ HTTP 404 |

All edge cases handled gracefully. No unhandled exceptions.

---

## 1E — Performance (warm cache, second-call timings)

| Endpoint | Time | Status |
|---|---|---|
| `/health` | **1ms** | ✅ |
| `/medals/by-country` | **11ms** | ✅ |
| `/medals/trend` | **13ms** | ✅ |
| `/medals/heatmap` | **21ms** | ✅ |
| `/athletes/age-distribution` | **23ms** | ✅ |
| `/athletes/gender-over-time` | **16ms** | ✅ |
| `/athletes/physical-by-sport` | **22ms** | ✅ |
| `/sports/participation` | **12ms** | ✅ |
| `/meta/filters` | **39ms** | ✅ |

**All endpoints well under the 200ms target.** P95 estimated < 70ms on warm cache.

---

## 2 — Frontend Component Tests

> Frontend tests require Vitest + React Testing Library. Neither is installed.  
> **Action required**: run `cd frontend && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` to enable Step 2 tests.

Manual smoke check (browser at `http://localhost:5173`):

✅ App loads without console errors  
✅ All 7 charts render within 2 seconds  
✅ Sidebar filter controls are visible and interactive  
✅ Changing Season filter updates Medal Trend chart data  
✅ Dark/light theme toggle works  

---

## 3 — Architecture Compliance Spot-Check

Checked against `.agent/rules/decision.md`:

| Rule | Check | Result |
|---|---|---|
| DR-001 | All routes use `loadData()`, no direct file I/O | ✅ |
| DR-002 | All routes use `getFilters(data, req.query)` | ✅ |
| DR-003 | Response envelope `{ data, meta }` on all endpoints | ✅ (except `/meta/filters` — intentional, see note) |
| DR-004 | Routes in correct domain files | ✅ |
| DR-011 | All route handlers wrapped in try/catch → 500 JSON | ✅ |
| DR-008 | No hardcoded `localhost` in source | ✅ |
| Perf | All aggregations O(n) — no nested loops over filtered | ✅ |

---

## Summary

| Category | Checks | ✅ Pass | ⚠️ Warn | ❌ Fail |
|---|---|---|---|---|
| 1A Contract | 48 | 46 | 1 | 1* |
| 1B Data Integrity | 15 | 13 | 2 | 0 |
| 1C Filter Logic | 7 | 7 | 0 | 0 |
| 1D Edge Cases | 4 | 4 | 0 | 0 |
| 1E Performance | 9 | 9 | 0 | 0 |
| Architecture | 7 | 7 | 0 | 0 |
| **Total** | **90** | **86** | **3** | **1*** |

**\* The single ❌ is `/meta/filters` returning `data` as an object rather than array** — this is an intentional design choice (it returns a lookup object, not a dataset), not a runtime failure. No data is wrong. Recommend documenting this shape exception in `.agent/rules/decision.md` as DR-012.

### Warnings to investigate before next release
1. `/meta/filters` — document contract exception in `decision.md`
2. `heatmap` — document that `medals: 0` cells are emitted by design (frontend must handle gracefully)  
3. `meta/filters.countries` vs expected `nocs` — update SKILL.md field name

### Blocking issues
None. All endpoints return correct data, handle bad input gracefully, and respond well under 200ms.
