import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, PhysicalBySport } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

export function PhysicalBySportChart({ filters }: { filters: Filters }) {
  const { data, loading, error } = useApi<PhysicalBySport[]>('/athletes/physical-by-sport', filters);

  const options = useMemo((): Highcharts.Options => ({
    chart: { type: 'scatter', backgroundColor: 'transparent', height: 320, spacingTop: 4, spacingBottom: 0 },
    title: { text: '' },
    xAxis: {
      title: { text: 'Avg Height (cm)', style: { color: '#64748B', fontSize: '10px' } },
      labels: { style: { color: '#64748B', fontSize: '10px' } },
      gridLineColor: 'rgba(148,163,184,0.08)',
      lineColor: 'transparent',
      tickColor: 'transparent',
    },
    yAxis: {
      title: { text: 'Avg Weight (kg)', style: { color: '#64748B', fontSize: '10px' } },
      labels: { style: { color: '#64748B', fontSize: '10px' } },
      gridLineColor: 'rgba(148,163,184,0.08)',
    },
    series: [{
      name: 'Sport',
      type: 'scatter',
      data: data?.map((d, i) => ({
        x: d.avgHeight,
        y: d.avgWeight,
        name: d.sport,
        marker: {
          radius: Math.sqrt(d.count) / 9 + 4,
          fillColor: `hsla(${(i * 31) % 360}, 75%, 60%, 0.7)`,
          lineWidth: 1,
          lineColor: `hsl(${(i * 31) % 360}, 60%, 50%)`,
        },
      })) ?? [],
    }],
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#1E293B',
      borderRadius: 8,
      style: { color: '#E2E8F0', fontFamily: 'DM Sans', fontSize: '12px' },
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        const p = this.point as Highcharts.Point & { name: string };
        return `<b>${p.name}</b><br/>Height: ${this.x} cm<br/>Weight: ${this.y} kg`;
      },
    },
    legend: {
      enabled: true,
      itemStyle: { color: '#94A3B8', fontFamily: 'DM Sans', fontSize: '11px', fontWeight: '400' },
    },
    credits: { enabled: false },
  }), [data]);

  if (loading) return <LoadingSkeleton height={320} />;
  if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;

  return <div className="chart-enter"><HighchartsReact highcharts={Highcharts} options={options} /></div>;
}
