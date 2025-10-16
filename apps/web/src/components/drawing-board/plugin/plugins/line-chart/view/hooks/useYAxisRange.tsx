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

            (entityValues || []).forEach(entityValue => {
                if (isLikeNumber(entityValue!)) {
                    const value = +entityValue!;

                    min = Math.min(min ?? Math.floor(value * 0.8), value);
                    max = Math.max(max ?? Math.ceil(value * 1.2), value);
                }
            });

            const newMin = minFun([min, result[resultIndex]?.min]);
            const newMax = maxFun([max, result[resultIndex]?.max]);
            result[resultIndex] = {
                min: newMin ?? MIN,
                max: newMax ?? MAX,
                interval: ((newMax ?? MAX) - (newMin ?? MIN)) / SPLIT_NUMBER,
            };
        });

        return result;
    }, [entity, newChartShowData]);

    return {
        getYAxisRange,
    };
};
