import { Router, Request, Response } from 'express';
import { loadData, getFilters } from '../dataLoader';

const router = Router();

// GET /api/v1/athletes/age-distribution
router.get('/age-distribution', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    
    const buckets: Record<string, number> = {};
    for (const row of filtered) {
      if (row.Age === null) continue;
      const bucket = `${Math.floor(row.Age / 5) * 5}-${Math.floor(row.Age / 5) * 5 + 4}`;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
    
    const result = Object.entries(buckets)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/athletes/gender-over-time
router.get('/gender-over-time', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    
    const byYear: Record<number, { M: number; F: number }> = {};
    for (const row of filtered) {
      if (!byYear[row.Year]) byYear[row.Year] = { M: 0, F: 0 };
      byYear[row.Year][row.Sex]++;
    }
    
    const result = Object.entries(byYear)
      .map(([year, counts]) => ({
        year: Number(year),
        male: counts.M,
        female: counts.F,
        total: counts.M + counts.F,
        femaleRatio: Math.round((counts.F / (counts.M + counts.F)) * 100),
      }))
      .sort((a, b) => a.year - b.year);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/athletes/physical-by-sport
router.get('/physical-by-sport', (req: Request, res: Response) => {
  try {
    const data = loadData();
    const { filtered, ...filters } = getFilters(data, req.query);
    
    const sportStats: Record<string, { heights: number[]; weights: number[] }> = {};
    
    for (const row of filtered) {
      if (!row.Height || !row.Weight) continue;
      if (!sportStats[row.Sport]) sportStats[row.Sport] = { heights: [], weights: [] };
      sportStats[row.Sport].heights.push(row.Height);
      sportStats[row.Sport].weights.push(row.Weight);
    }
    
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    const result = Object.entries(sportStats)
      .filter(([, s]) => s.heights.length >= 50)
      .map(([sport, s]) => ({
        sport,
        avgHeight: Math.round(avg(s.heights) * 10) / 10,
        avgWeight: Math.round(avg(s.weights) * 10) / 10,
        count: s.heights.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    res.json({ data: result, meta: { total: result.length, filters } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
