import React, { useEffect, useRef } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto'; // 引入 Chart.js

interface IProps {
    chartOptions: ChartConfiguration;
}
export default React.memo(({ chartOptions }: IProps) => {
    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        try {
            const chart: Chart | null = chartRef.current
                ? new Chart(chartRef.current, chartOptions)
                : null;

            return () => {
                /**
                 * 清空图表数据
                 */
                chart?.destroy();
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }, [chartRef, chartOptions]);

    return <canvas ref={chartRef} />;
});
