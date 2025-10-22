import { useMemo, useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { useMemoizedFn } from 'ahooks';
import { type EChartsType } from 'echarts/core';
import { isEmpty, isNil, isEqual } from 'lodash-es';

import { useSignalState, useTheme } from '@milesight/shared/src/hooks';

import {
    useBasicChartEntity,
    type ChartShowDataProps,
} from '@/components/drawing-board/plugin/hooks';

const generateTimes = (
    range: number[],
    stepSize: number,
    unit: 'minute' | 'hour' | 'day',
): number[] => {
    const timeList: number[] = [];
    const [start, end] = range || [];

    let currentTime = dayjs(start);
    while (currentTime.isBefore(dayjs(end))) {
        timeList.push(currentTime.valueOf());
        currentTime = currentTime.add(stepSize, unit);
    }

    return timeList;
};

interface IProps {
    xAxisRange: number[];
    chartWrapperRef: React.RefObject<HTMLDivElement>;
    xAxisConfig: ReturnType<typeof useBasicChartEntity>['xAxisConfig'];
    chartZoomRef: ReturnType<typeof useBasicChartEntity>['chartZoomRef'];
    chartShowData: ChartShowDataProps[];
}
export const useZoomChart = ({
    xAxisConfig,
    xAxisRange,
    chartZoomRef,
    chartWrapperRef,
    chartShowData,
}: IProps) => {
    const { matchTablet, matchLandscape } = useTheme();

    const [getChartZoom, setChartZoom] = useSignalState({
        start: 0,
        end: 100,
        isZooming: false,
        initialize: true,
    });

    /**
     * The current data is big data set
     */
    const [isBigData, setIsBigData] = useState<boolean[]>([]);
    const isBigDataRef = useRef<boolean[]>([]);

    // const chartZoomTimeValue = useMemo(() => {
    //     const { stepSize = 10, unit = 'minute' } = xAxisConfig || {};
    //     const timeLabels = generateTimes(xAxisRange, stepSize, unit);

    //     const startValue = timeLabels[Math.max(timeLabels.length - stepSize, 0)]; // Display the last n TH dot
    //     const endValue = timeLabels[timeLabels.length - 1]; // Display the last dot

    //     setChartZoom({
    //         ...getChartZoom(),
    //         initialize: true,
    //     });

    //     return {
    //         startValue: dayjs(startValue).valueOf(),
    //         endValue: dayjs(endValue).valueOf(),
    //     };
    // }, [getChartZoom, setChartZoom, xAxisConfig, xAxisRange]);

    const handleWheelEvent = useMemoizedFn((e: WheelEvent) => {
        if (!e) {
            return;
        }

        if (!e?.ctrlKey) {
            e?.stopImmediatePropagation();
        }
    });

    /**
     * Enable big data optimization sampling lttb threshold value
     * PC: 600
     * Mobile: 300
     */
    const samplingThreshold = useMemo(() => {
        if (matchLandscape) {
            return 600;
        }

        return matchTablet ? 300 : 600;
    }, [matchTablet, matchLandscape]);

    /**
     * Calculate current is big data
     */
    const getIsBigData = useMemoizedFn(
        (startValue: number, endValue: number, isZooming: boolean) => {
            if (
                !Array.isArray(chartShowData) ||
                isEmpty(chartShowData) ||
                isNil(startValue) ||
                Number.isNaN(Number(startValue)) ||
                isNil(endValue) ||
                Number.isNaN(Number(endValue))
            ) {
                return [];
            }

            return chartShowData.map(item => {
                const { chartOwnData = [] } = item || {};
                let dataLength = chartOwnData.length;

                if (isZooming) {
                    const sortData = chartOwnData.sort((a, b) => a.timestamp - b.timestamp);
                    let startIndex = sortData.findIndex(d => d.timestamp >= startValue);
                    let endIndex = sortData.findIndex(d => d.timestamp >= endValue);

                    startIndex = startIndex === -1 ? 0 : startIndex;
                    endIndex = endIndex === -1 ? sortData.length - 1 : endIndex;

                    dataLength = endIndex - startIndex;
                }

                return dataLength > samplingThreshold;
            });
        },
    );

    /** chart zoom callback */
    const zoomChart = useMemoizedFn((myChart: EChartsType) => {
        myChart.on('dataZoom', (params: any) => {
            const chartOption = myChart.getOption();
            const { dataZoom } = chartOption || {};
            const { start, end, startValue, endValue } = (dataZoom as any)?.[0] || {};

            const { isZooming = true } = params || {};
            if (isZooming) {
                chartZoomRef.current?.show();
            }

            const newIsBigData = getIsBigData(startValue, endValue, isZooming);
            if (!isEqual(newIsBigData, isBigDataRef.current)) {
                isBigDataRef.current = newIsBigData;
                setIsBigData(newIsBigData);
            }

            setChartZoom({
                start,
                end,
                isZooming,
                initialize: false,
            });
        });
        const resetZoom = () => {
            myChart.dispatchAction({
                type: 'dataZoom',
                start: 0,
                end: 100,
                isZooming: false,
            });
        };

        const { start, end, initialize } = getChartZoom();
        if (initialize) {
            resetZoom();
        } else {
            myChart.dispatchAction({
                type: 'dataZoom',
                start,
                end,
                isZooming: getChartZoom().isZooming,
            });
        }

        // store reset zoom state function
        chartZoomRef.current?.storeReset({
            resetZoom,
        });

        /**
         * Add wheel event listener to resolve scroll event prevented
         */
        chartWrapperRef.current?.addEventListener('wheel', handleWheelEvent, {
            capture: true,
        });
    });
    /** Display zoom button when mouse hover */
    const hoverZoomBtn = useMemoizedFn(() => {
        const chartNode = chartWrapperRef.current;
        if (!chartNode) return;

        const isZoomedOrPanned = () => {
            const currentZoom = getChartZoom();
            return currentZoom.isZooming;
        };

        chartZoomRef.current?.hide();

        chartNode.onmouseover = () => {
            if (!isZoomedOrPanned()) return;

            chartZoomRef.current?.show();
        };
        chartNode.onmouseleave = () => {
            if (!isZoomedOrPanned()) return;

            chartZoomRef.current?.hide();
        };
    });

    /**
     * Destroy component and release resources
     */
    useEffect(() => {
        const chartNode = chartWrapperRef.current;
        if (!chartNode) return;

        return () => {
            chartNode.onmouseover = null;
            chartNode.onmouseleave = null;
            chartNode.removeEventListener('wheel', handleWheelEvent, { capture: true });
        };
    }, [chartWrapperRef, handleWheelEvent]);

    return {
        /**
         * It's a big data set
         */
        isBigData,
        zoomChart,
        hoverZoomBtn,
    };
};
