import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, MedalByCountry } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { nocName } from '../../utils/nocNames';

export function MedalsByCountryChart({ filters }: { filters: Filters }) {
  const { data, loading, error } = useApi<MedalByCountry[]>('/medals/by-country', { ...filters, limit: '15' });

  const options = useMemo((): Highcharts.Options => ({
    chart: { type: 'bar', backgroundColor: 'transparent', height: 360, spacingBottom: 0, spacingTop: 4 },
    title: { text: '' },
    xAxis: {
      categories: data?.map((d) => nocName(d.noc)) ?? [],
      labels: { style: { color: '#94A3B8', fontFamily: 'DM Sans', fontSize: '11px' } },
      lineColor: 'transparent',
      gridLineColor: 'transparent',
    },
    yAxis: {
      title: { text: 'Medals', style: { color: '#64748B', fontSize: '10px' } },
      labels: { style: { color: '#64748B', fontSize: '10px' } },
      gridLineColor: 'rgba(148,163,184,0.08)',
    },
    legend: {
      itemStyle: { color: '#94A3B8', fontFamily: 'DM Sans', fontSize: '11px', fontWeight: '400' },
      symbolRadius: 3,
    },
    plotOptions: { bar: { stacking: 'normal', borderRadius: 2, borderWidth: 0, groupPadding: 0.08, pointPadding: 0.05 } },
    series: [
      { name: 'Gold', type: 'bar', data: data?.map((d) => d.Gold) ?? [], color: '#F59E0B' },
      { name: 'Silver', type: 'bar', data: data?.map((d) => d.Silver) ?? [], color: '#94A3B8' },
      { name: 'Bronze', type: 'bar', data: data?.map((d) => d.Bronze) ?? [], color: '#C2855A' },
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
