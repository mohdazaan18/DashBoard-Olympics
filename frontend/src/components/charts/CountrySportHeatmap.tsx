import Highcharts from 'highcharts';
import Heatmap from 'highcharts/modules/heatmap';
import HighchartsReact from 'highcharts-react-official';
import { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { Filters } from '../../types';
import { HeatmapCell } from '../../types/api.types';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { nocName } from '../../utils/nocNames';

Heatmap(Highcharts);

export function CountrySportHeatmap({ filters }: { filters: Filters }) {
    const { data, loading, error } = useApi<HeatmapCell[]>('/medals/heatmap', filters);

    const options = useMemo((): Highcharts.Options => {
        const sports = [...new Set(data?.map((d) => d.sport) ?? [])];
        const nocs = [...new Set(data?.map((d) => d.noc) ?? [])];
        const nocLabels = nocs.map(nocName);

        const seriesData: [number, number, number][] = (data ?? []).map((cell) => [
            sports.indexOf(cell.sport),
            nocs.indexOf(cell.noc),
            cell.medals,
        ]);

        return {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 360,
                marginTop: 10,
                marginBottom: 72,
                spacingBottom: 0,
            },
            title: { text: '' },
            xAxis: {
                categories: sports,
                labels: {
                    style: { color: '#64748B', fontFamily: 'DM Sans', fontSize: '10px' },
                    rotation: -38,
                },
                lineColor: 'transparent',
                tickColor: 'transparent',
            },
            yAxis: {
                categories: nocLabels,
                title: { text: '' },
                labels: { style: { color: '#94A3B8', fontFamily: 'DM Sans', fontSize: '11px' } },
                reversed: false,
            },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#0F172A'],
                    [0.25, '#1E3A5F'],
                    [0.5, '#1D4ED8'],
                    [0.75, '#7C3AED'],
                    [1, '#F59E0B'],
                ] as [number, string][],
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'middle',
                itemStyle: { color: '#64748B', fontSize: '10px' },
            },
            series: [{
                type: 'heatmap',
                name: 'Medals',
                data: seriesData,
                dataLabels: {
                    enabled: true,
                    color: '#E2E8F0',
                    style: { fontSize: '9px', fontWeight: '400', textOutline: 'none' },
                    formatter(this: Highcharts.PointLabelObject) {
                        return this.point.value ? String(this.point.value) : '';
                    },
                },
                borderWidth: 1,
                borderColor: 'rgba(15,23,42,0.6)',
            }],
            tooltip: {
                backgroundColor: '#0F172A',
                borderColor: '#1E293B',
                borderRadius: 8,
                style: { color: '#E2E8F0', fontFamily: 'DM Sans', fontSize: '12px' },
                formatter(this: Highcharts.TooltipFormatterContextObject) {
                    const x = this.series.xAxis.categories[(this.point.x ?? 0)];
                    const y = this.series.yAxis.categories[(this.point.y ?? 0)];
                    return `<b>${y}</b> · ${x}<br/>Medals: <b>${this.point.value ?? 0}</b>`;
                },
            },
            credits: { enabled: false },
        };
    }, [data]);

    if (loading) return <LoadingSkeleton height={360} />;
    if (error) return <div className="text-red-400 p-4">Failed to load: {error}</div>;

    return <div className="chart-enter"><HighchartsReact highcharts={Highcharts} options={options} /></div>;
}
