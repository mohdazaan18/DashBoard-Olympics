export interface ApiResponse<T> {
  data: T;
  meta: { total: number; filters: Record<string, unknown> };
}

export interface MedalTrendsData {
  years: number[];
  series: Array<{ name: string; data: [number, number][] }>;
}

export interface GenderData {
  years: number[];
  male: number[];
  female: number[];
}

export interface AgeChampionsRow {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  count: number;
}

export interface AgeChampionsResponse {
  data: AgeChampionsRow[];
  sports: string[];
  meta: { total: number; filters: Record<string, unknown> };
}

export interface SportPopularityData {
  years: number[];
  series: Array<{ name: string; data: number[] }>;
}

export interface PhysicalPoint {
  x: number;
  y: number;
  name: string;
  medal: 'Gold' | 'Silver' | 'Bronze' | null;
  sport: string;
  age: number | null;
}

export interface HeatmapData {
  matrix: [number, number, number][];
  countries: string[];
  sports: string[];
}

export interface FiltersData {
  sports: string[];
  years: number[];
  nocs: string[];
}

export type Season = 'Summer' | 'Winter' | 'All';
export type MedalType = 'Gold' | 'Silver' | 'Bronze' | 'None' | 'All';

export interface HeatmapCell {
  noc: string;
  sport: string;
  medals: number;
}
