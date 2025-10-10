import type { EChartsOption } from 'echarts';

import React, { useRef, useEffect, useMemo } from 'react';
import { useDebounceFn, useSize, useMemoizedFn } from 'ahooks';
import echarts from './echarts';

export function useEcharts(chartRef?: React.RefObject<HTMLDivElement>) {
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const offsetHeightTimeout = useRef<ReturnType<typeof setTimeout>>();
    const instanceTimeout = useRef<ReturnType<typeof setTimeout>>();

    /**
     * If echarts container size changed, then resize
     */
    function resize() {
        chartInstance.current?.resize();
    }
    const { run: resizeHandler } = useDebounceFn(resize, {
        wait: 0,
    });
    const containerSize = useSize(chartRef);
    useEffect(() => {
        if (!containerSize) return;

        resizeHandler?.();
    }, [containerSize, resizeHandler]);

    const initCharts = () => {
        if (!chartRef?.current) return;

        chartInstance.current = echarts.init(chartRef.current);
    };

    const getOptions: EChartsOption = useMemo(() => {
        return {
            backgroundColor: 'transparent',
        };
    }, []);

    const renderEcharts = useMemoizedFn(
        (options: EChartsOption, clear = true): Promise<echarts.ECharts | null> => {
            const currentOptions = {
                ...options,
                ...getOptions,
            };

            return new Promise(resolve => {
                if (chartRef?.current?.offsetHeight === 0) {
                    if (offsetHeightTimeout.current) {
                        clearTimeout(offsetHeightTimeout.current);
                    }

                    offsetHeightTimeout.current = setTimeout(async () => {
                        resolve(await renderEcharts(currentOptions));
                    }, 50);

                    return;
                }

                if (instanceTimeout.current) {
                    clearTimeout(instanceTimeout.current);
                }

                instanceTimeout.current = setTimeout(() => {
                    if (!chartInstance?.current) {
                        initCharts();
                    }

                    if (!chartInstance?.current) {
                        return;
                    }

                    clear && chartInstance.current?.clear();
                    chartInstance.current?.setOption(currentOptions);
                    resolve(chartInstance.current);
                }, 50);
            });
        },
    );

    useEffect(() => {
        return () => {
            /** Destroy instance and release resources */
            chartInstance.current?.dispose();
        };
    }, []);

    return {
        /**
         * To render echarts
         */
        renderEcharts,
        /**
         * Resize echarts
         */
        resize,
        /**
         * Get the echarts current instance
         */
        getChartInstance: () => chartInstance.current,
    };
}
