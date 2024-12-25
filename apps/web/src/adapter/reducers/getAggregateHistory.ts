import { EntityAPISchema } from '@/services/http';
import { getChartColor } from '@/plugin/utils';
import { getRange } from '../helper';
import type { PluginProps } from '../types';

type AggregateHistoryResult = EntityAPISchema['getAggregateHistory']['response'];
export const useReducer = () => {
    const run = (
        aggregateHistoryData: (AggregateHistoryResult | void)[],
        viewProps: PluginProps,
    ): MultipleAdapter<string | number | void> => {
        const { config } = viewProps;
        const { entity } = config || {};

        const entityList = Array.isArray(entity) ? entity : [entity].filter(Boolean);
        const newChartData: any[] = [];

        const newChartDatasets: MultipleAdapter<string | number | void>['value'] =
            aggregateHistoryData.map(historyData => {
                const { value, value_type: valueType } = historyData || {};

                newChartData.push({
                    value,
                    valueType,
                    range: getRange(entity),
                });
                return {
                    entityLabel: '',
                    entityValue: value,
                };
            });

        return {
            label: (entityList || []).map(e => e?.label || ''),
            value: newChartDatasets,
            attrs: newChartData,
            entity,
            chartColors: getChartColor(newChartDatasets || []),
        };
    };

    return {
        run,
    };
};
