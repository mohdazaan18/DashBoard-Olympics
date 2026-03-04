import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, MedalTrend } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

export function MedalTrendChart({ filters }: { filters: Filters }) {
  const { data, loading, error } = useApi<MedalTrend[]>('/medals/trend', filters);

  const options = useMemo((): Highcharts.Options => ({
    chart: { type: 'area', backgroundColor: 'transparent', height: 360, spacingTop: 4, spacingBottom: 0 },
    title: { text: '' },
    xAxis: {
      categories: data?.map((d) => String(d.year)) ?? [],
      labels: { style: { color: '#64748B', fontFamily: 'DM Sans', fontSize: '10px' }, step: 2 },
      lineColor: 'transparent',
      tickColor: 'transparent',
    },
    yAxis: {
      title: { text: '' },
      labels: { style: { color: '#64748B', fontSize: '10px' } },
      gridLineColor: 'rgba(148,163,184,0.08)',
    },
    legend: {
      itemStyle: { color: '#94A3B8', fontFamily: 'DM Sans', fontSize: '11px', fontWeight: '400' },
      symbolRadius: 3,
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineWidth: 2,
        marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
      },
    },
    series: [
      {
        name: 'Gold', type: 'area',
        data: data?.map((d) => d.Gold) ?? [],
        color: '#F59E0B',
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(245,158,11,0.35)'], [1, 'rgba(245,158,11,0.02)']] },
      },
      {
        name: 'Silver', type: 'area',
        data: data?.map((d) => d.Silver) ?? [],
        color: '#94A3B8',
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(148,163,184,0.3)'], [1, 'rgba(148,163,184,0.02)']] },
      },
      {
        name: 'Bronze', type: 'area',
        data: data?.map((d) => d.Bronze) ?? [],
        color: '#C2855A',
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(194,133,90,0.3)'], [1, 'rgba(194,133,90,0.02)']] },
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#0F172A',
      borderColor: '#1E293B',
      borderRadius: 8,
      style: { color: '#E2E8F0', fontFamily: 'DM Sans', fontSize: '12px' },
    },
    credits: { enabled: false },
  }), [data]);

  if (loading) return <LoadingSkeleton height={360} />;
  if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;

  return <div className="chart-enter"><HighchartsReact highcharts={Highcharts} options={options} /></div>;
}
