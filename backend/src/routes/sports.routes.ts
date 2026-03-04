import { Router, Request, Response } from 'express';
import { loadData, getFilters } from '../dataLoader';

const router = Router();

// GET /api/v1/sports/participation
router.get('/participation', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    const limit = Number(req.query.limit) || 25;

    const bySport: Record<string, number> = {};
    for (const row of filtered) {
      bySport[row.Sport] = (bySport[row.Sport] || 0) + 1;
    }

    const result = Object.entries(bySport)
      .map(([sport, count]) => ({ sport, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/sports/dominance (top country per sport)
router.get('/dominance', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    const limit = Number(req.query.limit) || 20;

    const sportCountry: Record<string, Record<string, number>> = {};

    for (const row of filtered) {
      if (!row.Medal) continue;
      if (!sportCountry[row.Sport]) sportCountry[row.Sport] = {};
      sportCountry[row.Sport][row.NOC] = (sportCountry[row.Sport][row.NOC] || 0) + 1;
    }

    const result = Object.entries(sportCountry).map(([sport, countries]) => {
      const sorted = Object.entries(countries).sort((a, b) => b[1] - a[1]);
      return {
        sport,
        topCountry: sorted[0]?.[0] ?? 'N/A',
        medals: sorted[0]?.[1] ?? 0,
        totalMedals: Object.values(countries).reduce((a, b) => a + b, 0),
      };
    }).sort((a, b) => b.totalMedals - a.totalMedals).slice(0, limit);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
