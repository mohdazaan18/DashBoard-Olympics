import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters, AgeDistribution } from '../../types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

export function AgeDistributionChart({ filters }: { filters: Filters }) {
    const { data, loading, error } = useApi<AgeDistribution[]>('/athletes/age-distribution', filters);

    const options = useMemo((): Highcharts.Options => {
        const total = data?.reduce((s, d) => s + d.count, 0) ?? 1;
        const peak = Math.max(...(data?.map((d) => d.count) ?? [1]));

        return {
            chart: { type: 'column', backgroundColor: 'transparent', height: 320, spacingTop: 4, spacingBottom: 0 },
            title: { text: '' },
            xAxis: {
                categories: data?.map((d) => d.range) ?? [],
                labels: { style: { color: '#64748B', fontFamily: 'DM Sans', fontSize: '10px' } },
                lineColor: 'transparent',
                tickColor: 'transparent',
            },
            yAxis: {
                title: { text: 'Athletes', style: { color: '#64748B', fontSize: '10px' } },
                labels: { style: { color: '#64748B', fontSize: '10px' } },
                gridLineColor: 'rgba(148,163,184,0.08)',
            },
            series: [{
                name: 'Athletes',
                type: 'column',
                borderRadius: 4,
                borderWidth: 0,
                pointPadding: 0.06,
                groupPadding: 0.06,
                data: data?.map((d) => {
                    const intensity = d.count / peak;
                    const h = Math.round(220 - intensity * 60); // deep blue → cyan
                    const l = Math.round(40 + intensity * 25);
                    return {
                        y: d.count,
                        color: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, `hsl(${h}, 85%, ${l + 15}%)`],
                                [1, `hsl(${h}, 70%, ${l}%)`],
                            ] as [number, string][],
                        },
                    };
                }) ?? [],
            }],
            tooltip: {
                backgroundColor: '#0F172A',
                borderColor: '#1E293B',
                borderRadius: 8,
                style: { color: '#E2E8F0', fontFamily: 'DM Sans', fontSize: '12px' },
                formatter(this: Highcharts.TooltipFormatterContextObject) {
                    const pct = (((this.y ?? 0) / total) * 100).toFixed(1);
                    return `<b>Age ${this.x}</b><br/>Athletes: <b>${(this.y ?? 0).toLocaleString()}</b> <span style="color:#64748B">(${pct}%)</span>`;
                },
            },
            legend: { enabled: false },
            credits: { enabled: false },
        };
    }, [data]);

    if (loading) return <LoadingSkeleton height={320} />;
    if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;

    return <div className="chart-enter"><HighchartsReact highcharts={Highcharts} options={options} /></div>;
}
