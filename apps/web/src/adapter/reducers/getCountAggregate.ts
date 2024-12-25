import { EntityAPISchema } from '@/services/http';
import { getChartColor } from '@/plugin/utils';
import { getRange } from '../helper';
import type { PluginProps } from '../types';

type AggregateHistoryResult = EntityAPISchema['getAggregateHistory']['response'];
export const useReducer = () => {
    const run = (
        aggregateHistoryData: (AggregateHistoryResult | void)[],
        viewProps: PluginProps,
    ) => {
        const { config } = viewProps;
        const { entity } = config || {};

        const entityList = Array.isArray(entity) ? entity : [entity].filter(Boolean);
        const [currentEntity] = entityList;

        const [currentHistoryData] = aggregateHistoryData || [];
        const { count_result: countResult } = currentHistoryData || {};

        const { label, value, attrs } = (countResult || []).reduce(
            (pre, cur) => {
                const { value, value_type: valueType, count } = cur || {};
                const currentValue = value as any;

                pre.label.push(currentValue);
                pre.value.push({
                    entityLabel: currentEntity?.label,
                    entityValue: count,
                });
                pre.attrs.push({
                    value: currentValue,
                    valueType,
                    range: getRange(entity),
                });
                return pre;
            },
            {
                label: [],
                value: [],
                attrs: [],
            } as Pick<MultipleAdapter, 'label' | 'value' | 'attrs'>,
        );

        return {
            label,
            value,
            attrs,
            entity: currentEntity,
            chartColors: getChartColor(value || []),
        };
    };

    return {
        run,
    };
};
