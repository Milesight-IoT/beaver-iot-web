import { useMemo } from 'react';
import * as Icons from '@milesight/shared/src/components/icons';
import { Tooltip } from '@/plugin/view-components';
import RemainChart from './components/remain-chart';
import { useSource } from './hooks';
import type { ViewConfigProps } from '../typings';
import './style.less';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
const View = (props: Props) => {
    const { config, configJson } = props;
    const { title, entity, metrics, time } = config || {};
    const { aggregateHistoryData } = useSource({ entity, metrics, time });
    const { isPreview } = configJson || {};

    // 百分比
    const percent = useMemo(() => {
        const { rawData } = entity || {};
        const { entityValueAttribute } = rawData || {};
        const { min, max } = entityValueAttribute || {};
        const { value } = aggregateHistoryData || {};
        if (!value) return 0;

        const range = (max || 0) - (min || 0);
        if (range === 0 || value === max) return 100;
        if (!range || value === min) return 0;

        const percent = Math.floor((value / range) * 100);
        return Math.min(100, Math.max(0, percent));
    }, [entity, aggregateHistoryData]);

    const { Icon, iconColor } = useMemo(() => {
        const iconType = config?.icon;
        const Icon = iconType && Icons[iconType as keyof typeof Icons];
        const iconColor = config?.iconColor;

        return {
            Icon,
            iconColor,
        };
    }, [config]);

    return (
        <div className={`ms-icon-remaining ${isPreview ? 'ms-icon-remaining-preview' : ''}`}>
            <div className="ms-icon-remaining__header">
                <Tooltip autoEllipsis title={title} />
            </div>
            <div className="ms-icon-remaining__percent">{percent}%</div>
            <div className="ms-icon-remaining__content">
                <RemainChart Icon={Icon} iconColor={iconColor} percent={100 - percent} />
            </div>
        </div>
    );
};

export default View;
