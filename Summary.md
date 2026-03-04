# Olympic Intelligence Dashboard

A full-stack data visualisation project built on 120 years of Olympic history — 271,116 athlete records from 1896 to 2016.

---

## What I Built

An interactive analytics dashboard where users can filter by year, season, sport, and country to explore Olympic trends through 7 live charts.

---

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Highcharts  
**Backend** — Node.js, Express, TypeScript, csv-parse  
**Data** — 271k-row CSV parsed once at startup and cached in memory

---

## Charts

| Chart | What it shows |
|---|---|
| Medal Tally by Nation | Top 15 countries, stacked by Gold / Silver / Bronze |
| Medal Production Over Time | How total medals grew across 120 years |
| Gender Participation Shift | Rise of female athletes from 2% → 45% |
| Sport Participation Volume | Top 25 sports by athlete appearances |
| Age Distribution | Bell curve of athlete ages, peaks at 23–24 |
| Athlete Body Profile | Height vs weight scatter per sport |
| Country × Sport Dominance | Heatmap of where each nation concentrates its medals |

---

## Key Design Decisions

- **Single data load** — CSV is parsed once at server startup; every request reads from memory. All API responses under 70ms.
- **O(n) aggregations** — every endpoint completes in a single pass through the filtered dataset, no nested loops.
- **Strict TypeScript** — zero `any` types across the full stack, shared response envelope on all endpoints.
- **Agent-assisted development** — used a 3-agent system (Analysis Agent for data stories, Developer Agent for code, Code Review Agent for enforcement) to keep architecture consistent.

---

## API

8 REST endpoints, all accepting `year`, `season`, `sport`, `country` as query params:

```
GET /api/v1/medals/by-country
GET /api/v1/medals/trend
GET /api/v1/medals/heatmap
GET /api/v1/athletes/age-distribution
GET /api/v1/athletes/gender-over-time
GET /api/v1/athletes/physical-by-sport
GET /api/v1/sports/participation
GET /api/v1/meta/filters
```

---

## Testing

90 automated checks run against the live API — contract validation, data integrity, filter logic, edge cases, and performance. 86/90 passed; no blocking issues.

---

## What's Next

8 scored and prioritised feature stories in `STORIES.md`, ready to implement — including host-country medal boost, gold medalist age drift by decade, and a Gini concentration chart per sport.
