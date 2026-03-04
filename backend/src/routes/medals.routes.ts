import { Router, Request, Response } from 'express';
import { loadData, getFilters } from '../dataLoader';

const router = Router();

// GET /api/v1/medals/by-country
router.get('/by-country', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);

    const counts: Record<string, { Gold: number; Silver: number; Bronze: number; total: number }> = {};

    for (const row of filtered) {
      if (!row.Medal) continue;
      if (!counts[row.NOC]) counts[row.NOC] = { Gold: 0, Silver: 0, Bronze: 0, total: 0 };
      counts[row.NOC][row.Medal]++;
      counts[row.NOC].total++;
    }

    const result = Object.entries(counts)
      .map(([noc, medals]) => ({ noc, ...medals }))
      .sort((a, b) => b.total - a.total)
      .slice(0, Number(req.query.limit) || 20);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/medals/trend
router.get('/trend', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);

    const byYear: Record<number, { Gold: number; Silver: number; Bronze: number }> = {};

    for (const row of filtered) {
      if (!row.Medal) continue;
      if (!byYear[row.Year]) byYear[row.Year] = { Gold: 0, Silver: 0, Bronze: 0 };
      byYear[row.Year][row.Medal]++;
    }

    const result = Object.entries(byYear)
      .map(([year, medals]) => ({ year: Number(year), ...medals }))
      .sort((a, b) => a.year - b.year);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/medals/heatmap
router.get('/heatmap', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    const limit = Number(req.query.limit) || 10;

    // O(n) single pass: accumulate [NOC][sport] medal counts + row/col totals
    const grid: Record<string, Record<string, number>> = {};
    const nocTotals: Record<string, number> = {};
    const sportTotals: Record<string, number> = {};

    for (const row of filtered) {
      if (!row.Medal) continue;
      if (!grid[row.NOC]) grid[row.NOC] = {};
      grid[row.NOC][row.Sport] = (grid[row.NOC][row.Sport] || 0) + 1;
      nocTotals[row.NOC] = (nocTotals[row.NOC] || 0) + 1;
      sportTotals[row.Sport] = (sportTotals[row.Sport] || 0) + 1;
    }

    const topNOCs = Object.entries(nocTotals).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([noc]) => noc);
    const topSports = Object.entries(sportTotals).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([sport]) => sport);

    const result: { noc: string; sport: string; medals: number }[] = [];
    for (const noc of topNOCs) {
      for (const sport of topSports) {
        result.push({ noc, sport, medals: grid[noc]?.[sport] ?? 0 });
      }
    }

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (_err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

