import { useMemoizedFn } from 'ahooks';
import { merge } from 'lodash-es';
import { type EChartsType } from 'echarts/core';

interface IProps {
    chartWrapperRef: React.RefObject<HTMLDivElement>;
}
export const useResizeChart = ({ chartWrapperRef }: IProps) => {
    /** Obtain the size of the chart */
    const getChartSize = useMemoizedFn((myChart: EChartsType) => {
        // Obtain the current container size
        const chartWidth = myChart.getWidth();
        const chartHeight = myChart.getHeight();
        const chartSize = Math.min(chartWidth, chartHeight);

        // Obtain the current configuration
        const currentOptions = myChart.getOption();
        const [currentSeries] = (currentOptions?.series as Record<string, any>[]) || [];

        const { radius = '75%' } = currentSeries || {};
        if (typeof radius === 'string') {
            // Percentage width
            const percent = parseFloat(radius) / 100;
            return chartSize * percent;
        }
        return radius;
    });

    // update the chart configuration
    const updateGaugeConfigure = useMemoizedFn((myChart: EChartsType) => {
        // Obtain the current configuration
        const currentOptions = myChart.getOption();
        const [currentSeries] = (currentOptions?.series as Record<string, any>[]) || [];
        const { splitNumber = 10 } = currentSeries || {};

        // Obtain the size of the chart
        const chartSize = getChartSize(myChart);
        const basicSize = chartSize * 0.04;

        const config = merge(currentOptions, {
            series: [
                {
                    progress: {
                        width: basicSize,
                    },
                    axisLine: {
                        lineStyle: {
                            width: basicSize,
                        },
                    },
                    splitLine: {
                        length: basicSize / 2,
                        lineStyle: {
                            width: 2,
                        },
                        distance: basicSize / 2 + 5,
                    },
                    axisLabel: {
                        // show: chartSize > 180,
                        distance: basicSize * 1.6,
                        width: chartSize / splitNumber,
                        overflow: 'truncate',
                        fontSize: basicSize * 0.85,
                    },
                    pointer: {
                        width: basicSize,
                    },
                    detail: {
                        fontSize: basicSize * 2,
                    },
                },
            ],
        });
        // Application modification
        myChart.setOption(config);
    });

    /** Update the chart when the container size changes */
    const resizeChart = useMemoizedFn((myChart: EChartsType) => {
        const chartWrapper = chartWrapperRef.current;
        if (!chartWrapper) return;

        let resizeObserver: ResizeObserver | null = null;
        let timer: NodeJS.Timeout | null = null;

        updateGaugeConfigure(myChart);
        timer = setTimeout(() => {
            resizeObserver = new ResizeObserver(() => {
                myChart.resize();
                updateGaugeConfigure(myChart);
            });
            resizeObserver.observe(chartWrapper);
        }, 1000);

        return () => {
            resizeObserver?.disconnect();
            timer && clearTimeout(timer);
        };
    });

    return {
        resizeChart,
    };
};
