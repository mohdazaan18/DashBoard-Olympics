import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { AthleteRecord } from './types';

let cache: AthleteRecord[] | null = null;

export function loadData(): AthleteRecord[] {
  if (cache) return cache;

  const dataPath = process.env.DATA_PATH || path.join(__dirname, '../data/athlete_events.csv');
  const content = fs.readFileSync(dataPath, 'utf-8');

  const raw = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  cache = raw.map((row) => ({
    ID: row.ID,
    Name: row.Name,
    Sex: row.Sex as 'M' | 'F',
    Age: row.Age === 'NA' ? null : Number(row.Age),
    Height: row.Height === 'NA' ? null : Number(row.Height),
    Weight: row.Weight === 'NA' ? null : Number(row.Weight),
    Team: row.Team,
    NOC: row.NOC,
    Games: row.Games,
    Year: Number(row.Year),
    Season: row.Season as 'Summer' | 'Winter',
    City: row.City,
    Sport: row.Sport,
    Event: row.Event,
    Medal: row.Medal === 'NA' ? null : (row.Medal as 'Gold' | 'Silver' | 'Bronze'),
  }));

  const years = [...new Set(cache.map((r) => r.Year))];
  console.log(`✅ ${cache.length} records | ${new Set(cache.map((r) => r.Sport)).size} sports | ${Math.min(...years)}–${Math.max(...years)}`);
  return cache;
}

export function getFilters(data: AthleteRecord[], q: Record<string, unknown>) {
  const year = typeof q.year === 'string' ? q.year : undefined;
  const yearMin = typeof q.yearMin === 'string' ? q.yearMin : undefined;
  const yearMax = typeof q.yearMax === 'string' ? q.yearMax : undefined;
  const season = typeof q.season === 'string' ? q.season : undefined;
  const sport = typeof q.sport === 'string' ? q.sport : undefined;
  const country = typeof q.country === 'string' ? q.country : undefined;

  let filtered = data;
  if (year) filtered = filtered.filter((r) => r.Year === Number(year));
  if (yearMin) filtered = filtered.filter((r) => r.Year >= Number(yearMin));
  if (yearMax) filtered = filtered.filter((r) => r.Year <= Number(yearMax));
  if (season) filtered = filtered.filter((r) => r.Season === season);
  if (sport) filtered = filtered.filter((r) => r.Sport === sport);
  if (country) filtered = filtered.filter((r) => r.NOC === country);

  return { filtered, year, yearMin, yearMax, season, sport, country };
}
