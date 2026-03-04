import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, GenderOverTime } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

export function GenderOverTimeChart({ filters }: { filters: Filters }) {
  const { data, loading, error } = useApi<GenderOverTime[]>('/athletes/gender-over-time', filters);

  const options = useMemo((): Highcharts.Options => ({
    chart: { type: 'line', backgroundColor: 'transparent', height: 300, spacingTop: 4, spacingBottom: 0 },
    title: { text: '' },
    xAxis: {
      categories: data?.map((d) => String(d.year)) ?? [],
      labels: { style: { color: '#64748B', fontFamily: 'DM Sans', fontSize: '10px' }, step: 4 },
      lineColor: 'transparent',
      tickColor: 'transparent',
    },
    yAxis: [
      {
        title: { text: 'Athletes', style: { color: '#64748B', fontSize: '10px' } },
        labels: { style: { color: '#64748B', fontSize: '10px' } },
        gridLineColor: 'rgba(148,163,184,0.08)',
      },
      {
        title: { text: '% Female', style: { color: '#64748B', fontSize: '10px' } },
        labels: { style: { color: '#64748B', fontSize: '10px' }, format: '{value}%' },
        opposite: true,
        gridLineColor: 'transparent',
      },
    ],
    legend: {
      itemStyle: { color: '#94A3B8', fontFamily: 'DM Sans', fontSize: '11px', fontWeight: '400' },
      symbolRadius: 3,
    },
    plotOptions: {
      line: {
        lineWidth: 2,
        marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } },
      },
    },
    series: [
      { name: 'Male', type: 'line', data: data?.map((d) => d.male) ?? [], color: '#38BDF8', lineWidth: 2 },
      { name: 'Female', type: 'line', data: data?.map((d) => d.female) ?? [], color: '#F472B6', lineWidth: 2 },
      { name: '% Female', type: 'line', yAxis: 1, data: data?.map((d) => d.femaleRatio) ?? [], color: '#A78BFA', dashStyle: 'ShortDash', lineWidth: 1.5 },
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

  if (loading) return <LoadingSkeleton height={300} />;
  if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;

  return <div className="chart-enter"><HighchartsReact highcharts={Highcharts} options={options} /></div>;
}
