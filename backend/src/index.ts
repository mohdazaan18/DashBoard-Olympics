import express from 'express';
import cors from 'cors';
import { loadData } from './dataLoader';
import medalsRouter from './routes/medals.routes';
import athletesRouter from './routes/athletes.routes';
import sportsRouter from './routes/sports.routes';
import metaRouter from './routes/meta.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/v1/medals', medalsRouter);
app.use('/api/v1/athletes', athletesRouter);
app.use('/api/v1/sports', sportsRouter);
app.use('/api/v1/meta', metaRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Preload data on startup
loadData();

app.listen(PORT, () => {
  console.log(`🚀 Olympic API running on port ${PORT}`);
});
