import { useCallback } from 'react';
import { isUndefined } from 'lodash-es';

import type { ChartShowDataProps } from '@/components/drawing-board/plugin/hooks';

interface IProps {
    entity?: EntityOptionType[];
    newChartShowData: ChartShowDataProps[];
}

/**
 * Whether it can be converted into numbers
 * @example
 * isLikeNumber('123') // true
 */
export const isLikeNumber = (value: string | number) => {
    if (value === null || value === '') {
        return false;
    }

    const valueNumber = +value;
    return !Number.isNaN(valueNumber) && Number.isFinite(valueNumber);
};

export const useYAxisRange = ({ entity, newChartShowData }: IProps) => {
    // If there is no data, display the default range
    const getYAxisRange = useCallback(() => {
        const [MIN, MAX] = [0, 100];
        if (!newChartShowData?.length) return [{ min: MIN, max: MAX }];

        const result: ({ min: number; max: number } | null)[] = [];
        // if all yAxisID are 'y1', then change the resultIndex to 0
        const isSameY1AxisID = newChartShowData.every(chartData => chartData?.yAxisID === 'y1');
        // If there is data, take it according to the range of the data
        newChartShowData.forEach((chartData, index) => {
            const { entityValues, yAxisID } = chartData || {};
            const resultIndex = isSameY1AxisID ? 0 : yAxisID === 'y1' ? 1 : 0;

            const currentEntity = entity?.[index];
            const { entityValueAttribute } = currentEntity?.rawData || {};

            const numberValues = (entityValues || [])
                .map(entityValue => {
                    if (isLikeNumber(entityValue!)) {
                        return +entityValue!;
                    }
                    return null;
                })
                .filter(item => item !== null);

            // If there is reported data, let the y-axis range be automatically calculated based on the reported data
            if (numberValues.length) {
                // Cover the case of multiple Y-axes
                result[resultIndex] = null;
                return;
            }
            // If there is no reported data and result[resultIndex] already has a value or is null, no processing is needed
            if (!isUndefined(result[resultIndex])) return;
            // Otherwise take the entity's min and max as the y-axis range
            const min = entityValueAttribute?.min ?? MIN;
            const max = entityValueAttribute?.max ?? MAX;
            result[resultIndex] = { min, max };
        });

        return result;
    }, [entity, newChartShowData]);

    return {
        getYAxisRange,
    };
};
