import React, { useEffect, useRef } from 'react';
import Chart, { type IConfig } from './gauge-controller';

interface IProps {
    chartOptions: IConfig;
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

export type IGaugeChartConfig = IConfig;
