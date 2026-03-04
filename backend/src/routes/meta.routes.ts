import { Router, Request, Response } from 'express';
import { loadData } from '../dataLoader';

const router = Router();

router.get('/filters', (_req: Request, res: Response) => {
  try {
    const data = loadData();
    const years = [...new Set(data.map((r) => r.Year))].sort((a, b) => a - b);
    const sports = [...new Set(data.map((r) => r.Sport))].sort();
    const countries = [...new Set(data.map((r) => r.NOC))].sort();
    const seasons = ['Summer', 'Winter'];

    res.json({ data: { years, sports, countries, seasons }, meta: { total: data.length, filters: {} } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
