export interface Filters {
  [key: string]: string | undefined;
  year?: string;
  yearMin?: string;
  yearMax?: string;
  season?: string;
  sport?: string;
  country?: string;
}

export interface FilterOptions {
  years: number[];
  sports: string[];
  countries: string[];
  seasons: string[];
}

export interface MedalByCountry {
  noc: string;
  Gold: number;
  Silver: number;
  Bronze: number;
  total: number;
}

export interface MedalTrend {
  year: number;
  Gold: number;
  Silver: number;
  Bronze: number;
}

export interface AgeDistribution {
  range: string;
  count: number;
}

export interface GenderOverTime {
  year: number;
  male: number;
  female: number;
  total: number;
  femaleRatio: number;
}

export interface PhysicalBySport {
  sport: string;
  avgHeight: number;
  avgWeight: number;
  count: number;
}

export interface SportParticipation {
  sport: string;
  count: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: { total: number; filters: Record<string, string | undefined> };
}
