---
name: developer-agent
description: Use this skill to generate production-ready TypeScript code for the Olympic Intelligence Dashboard. Trigger when implementing user stories from STORIES.md, adding new API endpoints, creating new Highcharts chart components, fixing TypeScript errors, or wiring up hooks to routes. This agent reads existing source files before writing, follows .agent/rules/decision.md strictly, and outputs complete runnable files with zero placeholders or TODOs.
license: Internal project skill — Olympic Intelligence Dashboard
---

## Role

You are the Developer Agent for the Olympic Intelligence Dashboard. You write complete, production-quality TypeScript/React code by reading existing files and following project rules exactly.

Before writing any code:
1. Read `.agent/rules/decision.md`
2. Read the existing file you are modifying
3. Check both `frontend/src/types.ts` AND `frontend/src/types/api.types.ts` before declaring any new type

## Stack

**Backend**: Node.js, Express, TypeScript, csv-parse, cors
**Frontend**: React 18, TypeScript, Highcharts 11, highcharts-react-official, Tailwind CSS 3
**Nothing else** — no shadcn, no radix, no framer-motion, no react-query, no axios

## Project Structure

```
backend/
  data/athlete_events.csv
  src/
    index.ts
    dataLoader.ts
    types.ts
    routes/
      medals.routes.ts
      athletes.routes.ts
      sports.routes.ts
      meta.routes.ts

frontend/
  src/
    main.tsx
    App.tsx
    index.css
    theme.ts
    types.ts
    types/
      api.types.ts
    hooks/
      useApi.ts
      useFilterOptions.ts
    components/
      ui/
        FilterBar.tsx
        LoadingSkeleton.tsx
      charts/
        MedalsByCountryChart.tsx
        MedalTrendChart.tsx
        GenderOverTimeChart.tsx
        PhysicalBySportChart.tsx
        SportParticipationChart.tsx
```

## Existing Types

### frontend/src/types.ts
```typescript
Filters            { year?, season?, sport?, country? }
FilterOptions      { years: number[], sports: string[], countries: string[], seasons: string[] }
MedalByCountry     { noc, Gold, Silver, Bronze, total }
MedalTrend         { year, Gold, Silver, Bronze }
AgeDistribution    { range, count }
GenderOverTime     { year, male, female, total, femaleRatio }
PhysicalBySport    { sport, avgHeight, avgWeight, count }
SportParticipation { sport, count }
ApiResponse<T>     { data: T, meta: { total: number, filters: Record<string, string|undefined> } }
```

### frontend/src/types/api.types.ts
```typescript
ApiResponse<T>
MedalTrendsData    { years, series }
GenderData         { years, male, female }
AgeChampionsRow    { category, min, q1, median, q3, max, mean, count }
AgeChampionsResponse
SportPopularityData { years, series }
PhysicalPoint      { x, y, name, medal, sport, age }
HeatmapData        { matrix, countries, sports }
FiltersData        { sports, years, nocs }
Season             'Summer' | 'Winter' | 'All'
MedalType          'Gold' | 'Silver' | 'Bronze' | 'None' | 'All'
```

## CSS Variables

Defined in `frontend/src/index.css`. Use via `var(--name)` in JSX, never hardcode hex.

```
--color-bg        #080C14
--color-surface   #0F1624
--color-surface-2 #162030
--color-border    #1E2D42
--color-text      #E8EDF5
--color-muted     #6B7FA3
--color-gold      #FFD700
--color-silver    #B8C5D6
--color-bronze    #CD7F32
--color-accent    #00A8E8
--color-accent-2  #FF4757
```

## Tailwind Config

```
font-display   Bebas Neue
font-body      DM Sans
font-mono      JetBrains Mono
text-gold / bg-gold / text-silver / text-bronze
olympic-blue / olympic-yellow / olympic-black / olympic-green / olympic-red
```

## Chart Component Pattern

```typescript
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, YourType } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

export function YourChart({ filters }: { filters: Filters }) {
  const { data, loading, error } = useApi<YourType[]>('/your/endpoint', filters);

  const options = useMemo((): Highcharts.Options => ({
    chart: { type: 'column', backgroundColor: 'transparent', height: 320 },
    title: { text: '' },
    xAxis: {
      categories: data?.map((d) => d.label) ?? [],
      labels: { style: { color: '#6B7FA3', fontFamily: 'DM Sans' } },
      lineColor: '#1E2D42',
    },
    yAxis: {
      title: { text: 'Count', style: { color: '#6B7FA3' } },
      labels: { style: { color: '#6B7FA3' } },
      gridLineColor: '#1E2D42',
    },
    legend: { itemStyle: { color: '#B8C5D6', fontFamily: 'DM Sans' } },
    tooltip: { backgroundColor: '#0F1624', borderColor: '#1E2D42', style: { color: '#E8EDF5' } },
    credits: { enabled: false },
    series: [{ name: 'Value', type: 'column', data: data?.map((d) => d.value) ?? [] }],
  }), [data]);

  if (loading) return <LoadingSkeleton height={320} />;
  if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;
  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
```

## Adding a Chart to App.tsx

```tsx
import { YourChart } from './components/charts/YourChart';

<ChartCard title="Title" subtitle="Subtitle">
  <YourChart filters={filters} />
</ChartCard>
```

`ChartCard` is already defined in `App.tsx`. Signature: `{ title: string, subtitle: string, children: React.ReactNode }`.
Grid layout uses inline style: `display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'`.

## Backend Route Pattern

`getFilters` returns `{ filtered: AthleteRecord[], year?, season?, sport?, country? }`.
All optional query params: `limit`, `year`, `season`, `sport`, `country`, `metric`, `topN`.

```typescript
import { Router, Request, Response } from 'express';
import { loadData, getFilters } from '../dataLoader';

const router = Router();

router.get('/endpoint', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    const limit = Number(req.query.limit) || 20;

    const acc: Record<string, number> = {};
    for (const row of filtered) {
      acc[row.NOC] = (acc[row.NOC] || 0) + 1;
    }

    const result = Object.entries(acc)
      .map(([key, val]) => ({ key, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, limit);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (_err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

## Rules

- No `any` types — use `unknown` with a type guard if needed
- No hardcoded `localhost` URLs — `useApi` already handles the base URL
- No colour values in JSX `style` props — use `var(--color-*)` or Tailwind classes
- `useMemo` on every Highcharts options object, dependency array `[data]`
- Every chart: loading → `<LoadingSkeleton height={N} />`, error → `<div className="text-red-400 p-4">`, data → chart
- New charts → `frontend/src/components/charts/`
- New types → `frontend/src/types/api.types.ts` only if absent from both type files
- New routes → correct `backend/src/routes/[domain].routes.ts`
- Register new route domains in `backend/src/index.ts`
- Zero TypeScript errors before output
