import { useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';

import Select, { type SelectProps } from '../select';

/**
 *  Chart display time selection component
 */
const ChartTimeSelect = (selectProps: PartialOptional<SelectProps, 'options'>) => {
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
            {
                label: getIntlText('dashboard.label_nearly_one_week'),
                value: 1440 * 60 * 1000 * 7,
            },
            {
                label: getIntlText('dashboard.label_nearly_one_month'),
                value: 1440 * 60 * 1000 * 30,
            },
            {
                label: getIntlText('dashboard.label_nearly_three_month'),
                value: 1440 * 60 * 1000 * 90,
            },
            {
                label: getIntlText('dashboard.label_nearly_half_year'),
                value: 1440 * 60 * 1000 * 180,
            },
            {
                label: getIntlText('dashboard.label_nearly_one_year'),
                value: 1440 * 60 * 1000 * 365,
            },
        ];
    }, [getIntlText]);

    const { options = defaultOptions, ...restOptions } = selectProps || {};

    return <Select options={options} {...restOptions} />;
};

export default ChartTimeSelect;
