import React, { useMemo } from 'react';
import { merge } from 'lodash-es';
import { ChartConfiguration } from 'chart.js/auto'; // 引入 Chart.js
import { getChartColor } from '@/plugin/utils';
import BasicChart from '../components/basicChart';

type LineChartOpts = ChartConfiguration<'line', (string | number | null)[], string>;
interface IProps extends Pick<MultipleAdapter<(string | number)[]>, 'label' | 'value'> {
    chartOptions?: LineChartOpts;
}
export default React.memo(({ label, value, chartOptions }: IProps) => {
    const customChartOptions = useMemo(() => {
        const chartColors = getChartColor(value || []);

        const defaultOptions: LineChartOpts = {
            type: 'line',
            data: {
                labels: label,
                datasets: (value || []).map((chart, index) => ({
                    label: chart.entityLabel,
                    data: chart.entityValue,
                    borderWidth: 1,
                    spanGaps: true,
                    backgroundColor: chartColors[index],
                })),
            },
            options: {
                responsive: true, // 使图表响应式
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        };
        return merge(defaultOptions, chartOptions);
    }, [chartOptions, label, value]);

    return <BasicChart chartOptions={customChartOptions as ChartConfiguration} />;
});
