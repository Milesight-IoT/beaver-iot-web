import { useMemo } from 'react';
import useI18n from '@milesight/shared/src/hooks/useI18n';

import Select, { type SelectProps } from '../select';

/**
 *  图表展示时间选择组件
 */
const ChartTimeSelect = (selectProps: SelectProps) => {
    const { getIntlText } = useI18n();

    const defaultOptions: OptionsProps[] = useMemo(() => {
        return [
            {
                label: getIntlText('dashboard.label_nearly_three_hours'),
                value: 180 * 60 * 1000,
            },
            {
                label: getIntlText('dashboard.label_nearly_six_hours'),
                value: 360 * 60 * 1000,
            },
            {
                label: getIntlText('dashboard.label_nearly_twelve_hours'),
                value: 720 * 60 * 1000,
            },
            {
                label: getIntlText('dashboard.label_nearly_one_days'),
                value: 1440 * 60 * 1000,
            },
        ];
    }, [getIntlText]);

    const { options = defaultOptions, ...restOptions } = selectProps || {};
    // @ts-expect-error
    return <Select options={options} {...restOptions} />;
};

export default ChartTimeSelect;
