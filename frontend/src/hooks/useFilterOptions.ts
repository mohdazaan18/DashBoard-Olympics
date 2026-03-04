import { useState, useEffect } from 'react';
import { FilterOptions } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

export function useFilterOptions() {
  const [options, setOptions] = useState<FilterOptions | null>(null);

  useEffect(() => {
    fetch(`${BASE}/meta/filters`)
      .then((r) => r.json())
      .then((res: { data: FilterOptions }) => setOptions(res.data))
      .catch(console.error);
  }, []);

  return options;
}
