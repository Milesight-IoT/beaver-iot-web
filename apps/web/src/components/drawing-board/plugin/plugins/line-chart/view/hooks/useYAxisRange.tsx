import { useCallback } from 'react';
import { min as minFun, max as maxFun } from 'lodash-es';

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
        const SPLIT_NUMBER = 5;
        const [MIN, MAX] = [0, 100];
        if (!newChartShowData?.length) return [{ min: MIN, max: MAX }];

        const result: {
            min: number;
            max: number;
            interval: number;
        }[] = [];
        // If there is data, take it according to the range of the data
        (newChartShowData || []).forEach((chartData, index) => {
            const { entityValues, yAxisID } = chartData || {};
            const resultIndex = yAxisID === 'y1' ? 1 : 0;

            const currentEntity = entity?.[index];
            const { entityValueAttribute } = currentEntity?.rawData || {};

            let min = entityValueAttribute?.min;
            let max = entityValueAttribute?.max;
            const numberValues = (entityValues || [])
                .map(entityValue => {
                    if (isLikeNumber(entityValue!)) {
                        return +entityValue!;
                    }
                    return null;
                })
                .filter(item => item !== null);

            if (numberValues.length) {
                min = Math.floor((minFun(numberValues) as number) * 0.8);
                max = Math.ceil((maxFun(numberValues) as number) * 1.2);
            }
            min = minFun([min, result[resultIndex]?.min]);
            max = maxFun([max, result[resultIndex]?.max]);
            const currentMin = min ?? MIN;
            const currentMax = max ?? MAX;
            result[resultIndex] = {
                min: currentMin,
                max: currentMax,
                interval: (currentMax - currentMin) / SPLIT_NUMBER,
            };
        });

        return result;
    }, [entity, newChartShowData]);

    return {
        getYAxisRange,
    };
};
