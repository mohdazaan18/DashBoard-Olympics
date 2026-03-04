# Architecture Decision Log — Olympic Intelligence Dashboard

This document is the single source of truth for all architectural decisions.
All three agents (Analysis, Developer, Code Review) must read this before doing any work.
Rules here override any other instruction.

---

## DR-001: Data Loading

**Decision**: Parse `backend/data/athlete_events.csv` exactly once at server startup using `loadData()` in `backend/src/dataLoader.ts`. Store the result in a module-level `cache` variable. Return the cache on every subsequent call.

**Rule**: `loadData()` is the only permitted way to access athlete data inside route handlers. Direct calls to `fs.readFileSync`, `csv-parse`, or any file I/O inside a route handler are forbidden.

---

## DR-002: Filter Logic

**Decision**: All query-param filtering is handled by `getFilters(data, req.query)` in `dataLoader.ts`. It returns `{ filtered: AthleteRecord[], year, season, sport, country }`.

**Rule**: Every route handler must call `getFilters` and work only with the `filtered` array it returns. No route may implement its own filter logic.

**Supported filters**: `year` (cast to number), `season` ('Summer' | 'Winter'), `sport` (string match), `country` (NOC string match)

---

## DR-003: API Response Shape

**Decision**: Every endpoint returns this exact envelope — no exceptions:

```typescript
{
  data: T,
  meta: {
    total: number,
    filters: Record<string, string | undefined>
  }
}
```

**Rule**: The frontend `useApi` hook reads `response.data` — any other shape breaks all charts simultaneously.

---

## DR-004: Route File Ownership

**Decision**: Routes are split by domain. Each domain owns its URL prefix.

```
medals.routes.ts    →  /api/v1/medals/*
athletes.routes.ts  →  /api/v1/athletes/*
sports.routes.ts    →  /api/v1/sports/*
meta.routes.ts      →  /api/v1/meta/*
```

**Rule**: New endpoints go in the matching domain file. A new domain requires a new `[domain].routes.ts` file AND registration in `backend/src/index.ts`.

---

## DR-005: TypeScript Strictness

**Decision**: `strict: true` is enabled in both `backend/tsconfig.json` and `frontend/tsconfig.json`.

**Rule**: Zero `any` types permitted. Use `unknown` with a type guard where the shape is genuinely uncertain. All backend types live in `backend/src/types.ts`. All frontend API response types live in `frontend/src/types/api.types.ts`.

---

## DR-006: Frontend Filter State

**Decision**: Filter state is owned exclusively by `App.tsx` via `useState<Filters>({})` and passed to charts as a `filters` prop.

**Rule**: No global state library. No React Context for filters. Charts never import or read state — they receive `filters: Filters` as a prop and forward it to `useApi`.

---

## DR-007: Highcharts Usage

**Decision**: `highcharts-react-official` wrapper. One React component per chart type. All chart components live in `frontend/src/components/charts/`.

**Rules**:
- Highcharts `options` object must be wrapped in `useMemo(() => ({...}), [data])`
- Every chart must set `chart.backgroundColor: 'transparent'`
- Every chart must set `credits: { enabled: false }`
- Dark theme colours applied to every chart (see Developer Agent SKILL.md for exact values)

---

## DR-008: Environment Variables

**Decision**: No hardcoded URLs or file paths in source code.

```
backend:  process.env.PORT              (default: 3001)
backend:  process.env.DATA_PATH         (default: ./data/athlete_events.csv)
backend:  process.env.FRONTEND_ORIGIN   (default: http://localhost:5173)
frontend: import.meta.env.VITE_API_URL  (default: /api/v1)
```

**Rule**: The Vite dev server proxy in `vite.config.ts` forwards `/api` → `http://localhost:3001`, so the frontend never needs a full URL in development.

---

## DR-009: Styling

**Decision**: Tailwind utility classes for layout and spacing. CSS custom properties (`var(--color-*)`) for all theme colours.

**Rules**:
- No hardcoded hex values in JSX or TSX files
- No inline `style` props in JSX except inside Highcharts config objects
- Fonts: `'Bebas Neue'` for display and headings, `'DM Sans'` for body, `'JetBrains Mono'` for numeric labels

---

## DR-010: Naming Conventions

```
React components:   PascalCase      MedalTrendChart.tsx
Custom hooks:       use + camelCase useFilterOptions.ts
Route endpoints:    kebab-case      /api/v1/medals/by-country
TypeScript types:   PascalCase      AthleteRecord, MedalByCountry
CSS variables:      --kebab-case    --color-accent
```

---

## DR-011: Error Handling

**Backend rule**: Every route handler is wrapped in try/catch. The catch block always returns `res.status(500).json({ error: 'Internal server error' })`. No error details exposed to client.

**Frontend rule**: Every component that calls `useApi` renders a visible error message when `error` is non-null. Use `var(--color-accent-2)` for error text colour.

**Rule**: No unhandled promise rejections. No `.catch(console.error)` as the sole handler in production code.

---

## Performance Targets

- All backend aggregations: O(n) — single pass through the filtered array, no nested loops
- P95 API response time: < 200ms
- Frontend: no chart re-renders unless the `filters` prop value actually changed
