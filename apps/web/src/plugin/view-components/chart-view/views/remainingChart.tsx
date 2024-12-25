import React, { useMemo } from 'react';
import * as Icons from '@milesight/shared/src/components/icons';
import RemainChart from '../components/basic-icon-remaining-chart';

interface IProps extends Pick<MultipleAdapter<number>, 'value' | 'attrs'> {
    config: Record<string, any>;
    configJson: CustomComponentProps;
}
export default React.memo(({ value, attrs, config, configJson }: IProps) => {
    const { isPreview } = configJson || {};
    const { icon: iconType, iconColor } = config || {};

    const chartRange = useMemo(() => {
        const currentValue = value?.[0]?.entityValue;
        const { range } = attrs?.[0] || {};

        const { min, max } = range || {};

        return {
            currentValue,
            minValue: min,
            maxValue: max,
        };
    }, [attrs, value]);

    // 百分比
    const percent = useMemo(() => {
        const { minValue: min, maxValue: max, currentValue } = chartRange || {};
        if (!currentValue) return 0;

        const range = (max || 0) - (min || 0);
        if (range === 0 || currentValue === max) return 100;
        if (!range || currentValue === min) return 0;

        const percent = Math.floor((currentValue / range) * 100);
        return Math.min(100, Math.max(0, percent));
    }, [chartRange]);

    const { Icon, IconColor } = useMemo(() => {
        const Icon = iconType && Icons[iconType as keyof typeof Icons];

        return {
            Icon,
            IconColor: iconColor,
        };
    }, [iconColor, iconType]);

    return (
        <div className={`${isPreview ? 'ms-icon-remaining-preview' : ''}`}>
            <div className="ms-icon-remaining__percent">{percent}%</div>
            <div className="ms-icon-remaining__content">
                <RemainChart Icon={Icon} iconColor={IconColor} percent={100 - percent} />
            </div>
        </div>
    );
});
