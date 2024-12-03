import { useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';

import Select, { type SelectProps } from '../select';

type IProps = SelectProps & { filters: DataAggregateType[] };
/**
 *  图表展示时间选择组件
 */
const ChartTimeSelect = (selectProps: IProps) => {
    const { getIntlText } = useI18n();
    const { options, filters, ...restOptions } = selectProps || {};

    const defaultOptions: OptionsProps<DataAggregateType>[] = useMemo(() => {
        return (
            [
                {
                    label: getIntlText('dashboard.label_latest_value'),
                    value: 'LAST',
                },
                {
                    label: getIntlText('dashboard.label_min_value'),
                    value: 'MIN',
                },
                {
                    label: getIntlText('dashboard.label_max_value'),
                    value: 'MAX',
                },
                {
                    label: getIntlText('dashboard.label_avg_value'),
                    value: 'AVG',
                },
                {
                    label: getIntlText('dashboard.label_sum_value'),
                    value: 'SUM',
                },
                {
                    label: getIntlText('dashboard.label_count_value'),
                    value: 'COUNT',
                },
            ] as const
        ).filter(item => !(filters || []).includes(item.value));
    }, [getIntlText, filters]);

    return <Select options={options || defaultOptions} {...restOptions} />;
};

export default ChartTimeSelect;
