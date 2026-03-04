import fs from 'fs';
import path from 'path';
import readline from 'readline';

export interface AthleteRow {
  ID: string;
  Name: string;
  Sex: 'M' | 'F';
  Age: number | null;
  Height: number | null;
  Weight: number | null;
  Team: string;
  NOC: string;
  Games: string;
  Year: number;
  Season: 'Summer' | 'Winter';
  City: string;
  Sport: string;
  Event: string;
  Medal: 'Gold' | 'Silver' | 'Bronze' | null;
}

let _cache: AthleteRow[] | null = null;

function parseNum(val: string): number | null {
  if (!val || val === 'NA' || val === '"NA"') return null;
  const n = parseFloat(val.replace(/"/g, ''));
  return isNaN(n) ? null : n;
}

function stripQuotes(val: string): string {
  return val.replace(/^"|"$/g, '').trim();
}

export async function loadData(csvPath: string): Promise<AthleteRow[]> {
  if (_cache) return _cache;

  const rows: AthleteRow[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath),
    crlfDelay: Infinity,
  });

  let isHeader = true;
  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }
    
    // Parse CSV properly handling quoted fields
    const fields = parseCsvLine(line);
    if (fields.length < 15) continue;

    const medal = stripQuotes(fields[14]);
    const sex = stripQuotes(fields[2]);

    rows.push({
      ID: stripQuotes(fields[0]),
      Name: stripQuotes(fields[1]),
      Sex: sex === 'F' ? 'F' : 'M',
      Age: parseNum(fields[3]),
      Height: parseNum(fields[4]),
      Weight: parseNum(fields[5]),
      Team: stripQuotes(fields[6]),
      NOC: stripQuotes(fields[7]),
      Games: stripQuotes(fields[8]),
      Year: parseInt(stripQuotes(fields[9])) || 0,
      Season: stripQuotes(fields[10]) === 'Winter' ? 'Winter' : 'Summer',
      City: stripQuotes(fields[11]),
      Sport: stripQuotes(fields[12]),
      Event: stripQuotes(fields[13]),
      Medal: medal === 'Gold' ? 'Gold' : medal === 'Silver' ? 'Silver' : medal === 'Bronze' ? 'Bronze' : null,
    });
  }

  _cache = rows;
  console.log(`✅ Loaded ${rows.length} athlete records`);
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function getData(): AthleteRow[] {
  if (!_cache) throw new Error('Data not loaded. Call loadData() first.');
  return _cache;
}

export function getUniqueValues<K extends keyof AthleteRow>(key: K): Array<AthleteRow[K]> {
  const data = getData();
  return [...new Set(data.map(r => r[key]))].filter(Boolean).sort() as Array<AthleteRow[K]>;
}
