import { useMemo } from 'react';

import {
    POSITION_AXIS,
    type ChartEntityPositionValueType,
} from '@/components/drawing-board/plugin/components/chart-entity-position';
import { type ChartShowDataProps } from '@/components/drawing-board/plugin/hooks/useBasicChartEntity';

export interface UseLineChartProps {
    /**
     * entity and display position information
     */
    entityPosition: ChartEntityPositionValueType[];
    /**
     * chart data
     */
    chartShowData: ChartShowDataProps[];
}

/**
 * To handle line chart properties
 */
export function useLineChart(props: UseLineChartProps) {
    const { entityPosition, chartShowData } = props;

    const newChartShowData = useMemo(() => {
        if (!Array.isArray(chartShowData)) return [];

        return chartShowData.map(data => {
            const newEntity = entityPosition?.find(e => e.id === data.id);
            if (!newEntity) return data;

            return {
                ...data,
                yAxisID: newEntity.position === POSITION_AXIS.LEFT ? 'y' : 'y1',
            };
        });
    }, [entityPosition, chartShowData]);

    const isDisplayY1 = useMemo(() => {
        return newChartShowData.some(data => data.yAxisID === 'y1');
    }, [newChartShowData]);

    return {
        /**
         * chart show data
         */
        newChartShowData,
        /**
         * whether display y1 axis
         */
        isDisplayY1,
    };
}
