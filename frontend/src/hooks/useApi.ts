import { useState, useEffect } from 'react';
import { ApiResponse } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

export function useApi<T>(endpoint: string, params: Record<string, string | undefined>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v); });
    
    setLoading(true);
    setError(null);

    fetch(`${BASE}${endpoint}?${query}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ApiResponse<T>>;
      })
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error };
}
