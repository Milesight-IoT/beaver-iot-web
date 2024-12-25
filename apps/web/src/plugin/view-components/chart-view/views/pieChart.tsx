import React, { useMemo } from 'react';
import { merge } from 'lodash-es';
import { ChartConfiguration } from 'chart.js/auto'; // 引入 Chart.js
import { getChartColor } from '@/plugin/utils';
import BasicChart from '../components/basicChart';

type PieChartOpts = ChartConfiguration<'pie', (string | number | null)[], string>;
interface IProps extends Pick<MultipleAdapter<string | number>, 'label' | 'value'> {
    chartOptions?: PieChartOpts;
}
export default React.memo(({ value = [], label = [], chartOptions }: IProps) => {
    const customChartOptions = useMemo(() => {
        const chartColors = getChartColor(value || []);

        const defaultOptions: PieChartOpts = {
            type: 'pie',
            data: {
                labels: label, // 数据标签
                datasets: [
                    {
                        data: value.map(item => item?.entityValue),
                        borderWidth: 1, // 边框宽度
                        backgroundColor: chartColors,
                    },
                ],
            },
            options: {
                responsive: true, // 使图表响应式
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right', // 图例位置
                    },
                    tooltip: {
                        enabled: true, // 启用提示工具
                    },
                },
            },
        };
        return merge(defaultOptions, chartOptions);
    }, [chartOptions, label, value]);

    return <BasicChart chartOptions={customChartOptions as ChartConfiguration} />;
});
