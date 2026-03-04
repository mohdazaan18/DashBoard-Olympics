import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, SportParticipation } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

export function SportParticipationChart({ filters }: { filters: Filters }) {
  const { data, loading, error } = useApi<SportParticipation[]>('/sports/participation', filters);

  const options = useMemo((): Highcharts.Options => ({
    chart: { type: 'column', backgroundColor: 'transparent', height: 300, spacingTop: 4, spacingBottom: 0 },
    title: { text: '' },
    xAxis: {
      categories: data?.map((d) => d.sport) ?? [],
      labels: { style: { color: '#64748B', fontSize: '10px' }, rotation: -40 },
      lineColor: 'transparent',
      tickColor: 'transparent',
    },
    yAxis: {
      title: { text: 'Participations', style: { color: '#64748B', fontSize: '10px' } },
      labels: { style: { color: '#64748B', fontSize: '10px' } },
      gridLineColor: 'rgba(148,163,184,0.08)',
    },
    series: [{
      name: 'Athletes',
      type: 'column',
      data: data?.map((d, i) => ({
        y: d.count,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, `hsl(${210 + i * 4}, 80%, 65%)`],
            [1, `hsl(${210 + i * 4}, 60%, 35%)`],
          ] as [number, string][],
        },
      })) ?? [],
      borderRadius: 3,
      borderWidth: 0,
      pointPadding: 0.05,
      groupPadding: 0.05,
    }],
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#1E293B',
      borderRadius: 8,
      style: { color: '#E2E8F0', fontFamily: 'DM Sans', fontSize: '12px' },
    },
    legend: { enabled: false },
    credits: { enabled: false },
  }), [data]);

  if (loading) return <LoadingSkeleton height={300} />;
  if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;

  return <div className="chart-enter"><HighchartsReact highcharts={Highcharts} options={options} /></div>;
}
