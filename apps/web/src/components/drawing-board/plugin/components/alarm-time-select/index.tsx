import { useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';

import Select, { type SelectProps } from '../select';

/**
 *  Alarm default time selection component
 */
const AlarmTimeSelect = (selectProps: PartialOptional<SelectProps, 'options'>) => {
    const { getIntlText } = useI18n();

    const defaultOptions: OptionsProps[] = useMemo(() => {
        return [
            {
                label: getIntlText('dashboard.label_nearly_one_days'),
                value: 1440 * 60 * 1000,
            },
            {
                label: getIntlText('dashboard.label_nearly_three_days'),
                value: 1440 * 60 * 1000 * 3,
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
        ];
    }, [getIntlText]);

    const { options = defaultOptions, ...restOptions } = selectProps || {};

    return <Select options={options} {...restOptions} />;
};

export default AlarmTimeSelect;
