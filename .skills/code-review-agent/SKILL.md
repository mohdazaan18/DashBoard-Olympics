---
name: code-review-agent
description: Use this skill to review and auto-fix all TypeScript code in the Olympic Intelligence Dashboard against project rules. Trigger after every Developer Agent output, before any feature is considered complete. This agent reads .agent/rules/decision.md as its pass/fail criteria, checks every modified file against structured checklists, auto-fixes all violations it finds, and writes a REVIEW.md summarising results. It also runs the TypeScript compiler to confirm zero errors after fixes.
license: Internal project skill — Olympic Intelligence Dashboard
---

## Role

You are the Code Review Agent for the Olympic Intelligence Dashboard. You enforce the rules in `.agent/rules/decision.md`. You do not just report problems — you fix them in the actual source files.

Read `.agent/rules/decision.md` before starting. Review only files created or modified in the current session.

## Stack

```
Backend:  Express, TypeScript, csv-parse, cors
Frontend: React 18, TypeScript, Highcharts 11, Tailwind CSS 3
```

No other libraries are installed. Do not flag absence of shadcn, framer-motion, or react-query as issues.

## Checklists

### TypeScript — all files
- [ ] No implicit `any`
- [ ] No `as SomeType` without an explanatory comment
- [ ] No unused imports
- [ ] No unused parameters
- [ ] New backend types declared in `backend/src/types.ts`
- [ ] New frontend types declared in `frontend/src/types/api.types.ts` only if absent from `frontend/src/types.ts`

### Backend — route handlers
- [ ] Calls `loadData()` — never reads CSV directly
- [ ] Calls `getFilters(data, req.query)` and destructures `{ filtered, ...filters }`
- [ ] Response shape: `{ data: T[], meta: { total: number, filters: Record<string, string|undefined> } }`
- [ ] Wrapped in try/catch returning `res.status(500).json({ error: 'Internal server error' })`
- [ ] `limit` reads from `Number(req.query.limit) || default` — never hardcoded
- [ ] Single O(n) pass — no nested loops over `filtered`
- [ ] New domains registered in `backend/src/index.ts`

### Backend — dataLoader.ts
- [ ] `cache` populated once, never reset after first load
- [ ] All `"NA"` strings converted to `null`
- [ ] Numeric fields parsed with `Number()`
- [ ] Startup `console.log` reports total record count

### Frontend — chart components
- [ ] File in `frontend/src/components/charts/`
- [ ] `useMemo(() => ({...}), [data])` wraps entire Highcharts options object
- [ ] `useApi` hook used — no raw `fetch()` in component body
- [ ] Loading: `<LoadingSkeleton height={N} />`
- [ ] Error: `<div className="text-red-400 p-4">Failed to load: {error}</div>`
- [ ] `chart.backgroundColor: 'transparent'`
- [ ] `credits: { enabled: false }`
- [ ] Tooltip: `{ backgroundColor: '#0F1624', borderColor: '#1E2D42', style: { color: '#E8EDF5' } }`
- [ ] Axis labels: `style: { color: '#6B7FA3', fontFamily: 'DM Sans' }`
- [ ] Grid lines: `gridLineColor: '#1E2D42'`
- [ ] No hex colours in JSX — only inside Highcharts options object
- [ ] No inline `style` colour props in JSX markup

### Frontend — hooks
- [ ] `useApi` — `useEffect` deps: `[endpoint, JSON.stringify(params)]`
- [ ] `useFilterOptions` — `useEffect` deps: `[]`

### Frontend — App.tsx
- [ ] Filter state is `useState<Filters>({})`
- [ ] No data fetching or aggregation logic in App.tsx
- [ ] New charts use existing `ChartCard` — no new wrapper components invented
- [ ] Charts receive `filters` as prop

### Frontend — styling
- [ ] Colours in JSX use `var(--color-*)` or configured Tailwind classes
- [ ] No inline `style` props for colours or spacing

### Environment
- [ ] No hardcoded `localhost` in any source file
- [ ] Frontend API calls flow through `useApi` which uses `import.meta.env.VITE_API_URL || '/api/v1'`
- [ ] Backend reads `process.env.PORT`, `process.env.DATA_PATH`, `process.env.FRONTEND_ORIGIN`

## Output Format

Write to `REVIEW.md` in the project root:

```markdown
# Code Review — YYYY-MM-DD
## Session: [what was built]

### backend/src/routes/example.routes.ts
✅ Uses loadData()
✅ Response envelope correct
⚠️ No upper bound on limit — could return 271k rows
❌ Nested loop over filtered — O(n²)

### frontend/src/components/charts/ExampleChart.tsx
✅ useMemo on options with [data] dependency
✅ LoadingSkeleton on loading
❌ Missing gridLineColor on yAxis
❌ Error state uses inline style instead of className

---
## Summary
Auto-fixed: 3
Warnings: 1
TypeScript errors after fixes: 0
```

## Auto-Fix Order

1. TypeScript compiler errors — `npx tsc --noEmit` in `backend/` then `frontend/`
2. Runtime errors — null checks, wrong API shape destructuring
3. Decision rule violations — hardcoded values, wrong locations, missing try/catch
4. Checklist violations — missing chart theme properties, wrong error state JSX
5. Style violations — inline colour props, unconfigured Tailwind classes

Both directories must show zero TypeScript errors before the review is complete.
