# Olympic Intelligence Dashboard

> 120 years of Olympic data — 271,116 athlete records — visualised in an interactive, real-time dashboard.

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript) ![Stack](https://img.shields.io/badge/Highcharts-11-1E8449?style=flat) ![Stack](https://img.shields.io/badge/Express-4-000000?style=flat&logo=express)

---

## What it is

An analytics dashboard built on the [120 Years of Olympic History](https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results) dataset. It lets you filter by year range, season, sport, and country, then explore medal trends, athlete demographics, and sport-level patterns through seven interactive Highcharts visualisations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript 5, Vite, Tailwind CSS 3, Highcharts 11 |
| Backend | Node.js, Express 4, TypeScript 5, csv-parse |
| Data | `athlete_events.csv` — parsed once at startup, cached in memory |

---

## Project Structure

```
olympic-dashboard/
├── backend/
│   ├── data/
│   │   └── athlete_events.csv
│   └── src/
│       ├── index.ts
│       ├── dataLoader.ts
│       ├── types.ts
│       └── routes/
│           ├── medals.routes.ts
│           ├── athletes.routes.ts
│           ├── sports.routes.ts
│           └── meta.routes.ts
└── frontend/
    └── src/
        ├── App.tsx
        ├── index.css
        ├── hooks/
        │   ├── useApi.ts
        │   └── useFilterOptions.ts
        ├── components/
        │   ├── ui/
        │   │   ├── Sidebar.tsx
        │   │   └── LoadingSkeleton.tsx
        │   └── charts/
        │       ├── MedalsByCountryChart.tsx
        │       ├── MedalTrendChart.tsx
        │       ├── GenderOverTimeChart.tsx
        │       ├── SportParticipationChart.tsx
        │       ├── AgeDistributionChart.tsx
        │       ├── PhysicalBySportChart.tsx
        │       └── CountrySportHeatmap.tsx
        └── types/
            ├── types.ts
            └── api.types.ts
```

---

## Getting Started

**Prerequisites:** Node.js ≥ 18

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# backend/.env
PORT=3001
DATA_PATH=./data/athlete_events.csv
FRONTEND_ORIGIN=http://localhost:5173
```

```bash
# frontend/.env
VITE_API_URL=/api/v1
```

### 3. Run

```bash
# Terminal 1 — backend (hot-reload)
cd backend && npm run dev

# Terminal 2 — frontend (Vite dev server)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## API Reference

All endpoints accept optional query params: `year`, `season`, `sport`, `country`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/meta/filters` | Available filter values |
| GET | `/api/v1/medals/by-country` | Medal totals per NOC |
| GET | `/api/v1/medals/trend` | Gold/Silver/Bronze counts per edition |
| GET | `/api/v1/medals/heatmap` | Country × Sport medal matrix |
| GET | `/api/v1/athletes/age-distribution` | Athlete count per age bracket |
| GET | `/api/v1/athletes/gender-over-time` | Male/female ratio per year |
| GET | `/api/v1/athletes/physical-by-sport` | Avg height & weight per sport |
| GET | `/api/v1/sports/participation` | Top sports by athlete appearances |

Every response follows the envelope:
```json
{ "data": [...], "meta": { "total": 0, "filters": {} } }
```

---

## Charts

| Chart | Type | Key insight |
|---|---|---|
| Medal Tally by Nation | Stacked bar | US, USSR, Germany dominate all-time |
| Medal Production Over Time | Area | Sharp post-WWII growth in events |
| Gender Participation Shift | Dual-axis line | Female share rose from 2% → 45% |
| Sport Participation Volume | Column | Athletics dwarfs every other sport |
| Age Distribution | Column | Peak Olympic age is 23–24 |
| Athlete Body Profile | Scatter | Clear sport-by-sport physique clusters |
| Country × Sport Dominance | Heatmap | US swimming vs Soviet gymnastics |

---

## Planned Stories

See [`STORIES.md`](./STORIES.md) for 8 scored and prioritised feature stories ready for implementation.
