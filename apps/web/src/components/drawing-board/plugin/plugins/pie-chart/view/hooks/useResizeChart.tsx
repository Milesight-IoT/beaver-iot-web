import { useMemoizedFn } from 'ahooks';
import { type EChartsType } from 'echarts/core';

interface IProps {
    chartWrapperRef: React.RefObject<HTMLDivElement>;
}
export const useResizeChart = ({ chartWrapperRef }: IProps) => {
    /** Update the chart when the container size changes */
    /** Update the chart when the container size changes */
    const resizeChart = useMemoizedFn((myChart: EChartsType) => {
        const chartWrapper = chartWrapperRef.current;
        if (!chartWrapper) return;

        let resizeObserver: ResizeObserver | null = null;
        let timer: NodeJS.Timeout | null = null;

        timer = setTimeout(() => {
            resizeObserver = new ResizeObserver(() => {
                myChart.resize();
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
