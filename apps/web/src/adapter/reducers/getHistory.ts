import { useTime } from '@milesight/shared/src/hooks';
import { getChartColor } from '@/plugin/utils';
import { getRange } from '../helper';
import type { PluginProps } from '../types';

export const useReducer = () => {
    const { getTimeFormat } = useTime();

    const run = (
        result: (SearchResponseType<EntityHistoryData[]> | void)[],
        viewProps: PluginProps,
    ): MultipleAdapter<string | number | void> => {
        const { config } = viewProps;
        const { entity } = config || {};

        const historyData = (result || []).map(d => d?.content || []);
        const entityList = Array.isArray(entity) ? entity : [entity].filter(Boolean);

        /**
         * 去重处理，获取所有值的时间段
         */
        const newChartLabels = historyData
            .reduce((a: number[], c) => {
                const times = (c || [])?.map(h => h.timestamp)?.filter(Boolean) || [];

                return [...new Set([...a, ...times])];
            }, [])
            .sort((a, b) => Number(a) - Number(b));

        const newChartDatasets: any[] = [];
        const newChartData: any[] = [];

        /**
         * 实体数据转换
         */
        (historyData || []).forEach((h, index) => {
            const currentEntity = entityList[index];
            const { label: entityLabel } = currentEntity || {};

            /**
             * 根据时间戳判断当前实体在该时间段是否有数据
             */
            const chartData = newChartLabels.map(l => {
                const valueIndex = h.findIndex(item => item.timestamp === l);
                if (valueIndex === -1) return null;

                const { value, value_type: valueType } = h[valueIndex];

                newChartData.push({
                    value,
                    valueType,
                    range: getRange(entity),
                });
                return value;
            });

            if (entityLabel) {
                newChartDatasets.push({
                    entityLabel,
                    entityValue: chartData,
                });
            }
        });

        return {
            entity,
            label: newChartLabels.map(l => getTimeFormat(Number(l))),
            value: newChartDatasets,
            attrs: newChartData,
            chartColors: getChartColor(newChartDatasets || []),
        };
    };

    return {
        run,
    };
};
