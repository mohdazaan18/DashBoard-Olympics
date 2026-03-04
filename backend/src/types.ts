export interface AthleteRecord {
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

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    filters: Record<string, string | undefined>;
  };
}
