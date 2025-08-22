import { useCallback } from 'react';
import { isNil } from 'lodash-es';
import type { ChartShowDataProps } from '@/components/drawing-board/plugin/hooks';

interface IProps {
    entity?: EntityOptionType[];
    chartShowData: ChartShowDataProps[];
}
export const useYAxisRange = ({ entity, chartShowData }: IProps) => {
    // If there is no data, display the default range
    const getYAxisRange = useCallback(() => {
        const [MIN, MAX] = [0, 100];
        // Is there any data
        const hasEntityValueItem = chartShowData.find(chart => !!chart.entityValues.length);
        if (hasEntityValueItem) return;

        // Is there a maximum/minimum value
        if (!entity) return { min: MIN, max: MAX };
        const currentEntity = entity.find(item => {
            const { min, max } = item?.rawData?.entityValueAttribute || {};

            return !isNil(min) && !isNil(max);
        });
        if (!currentEntity) return { min: MIN, max: MAX };

        const { min = 0, max = 100 } = currentEntity?.rawData?.entityValueAttribute || {};
        return { min, max };
    }, [chartShowData, entity]);

    return {
        getYAxisRange,
    };
};
