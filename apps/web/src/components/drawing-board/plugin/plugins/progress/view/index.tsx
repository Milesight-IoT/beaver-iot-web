import { useMemo } from 'react';
import { get } from 'lodash-es';
import cls from 'classnames';

import { useTheme } from '@milesight/shared/src/hooks';
import * as Icons from '@milesight/shared/src/components/icons';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import RemainChart from './components/remain-chart';
import { useSource } from './hooks';
import { useGridLayout, useActivityEntity, useStableValue } from '../../../hooks';
import type { ViewConfigProps } from '../typings';
import type { BoardPluginProps } from '../../../types';
import './style.less';

interface Props {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: BoardPluginProps;
}
const View = (props: Props) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { title, entity: unStableValue, metrics, time } = config || {};
    const { isPreview, pos } = configJson || {};

    const { matchTablet } = useTheme();
    const { oneByOne } = useGridLayout(pos);
    const { getLatestEntityDetail } = useActivityEntity();
    const { stableValue: entity } = useStableValue(unStableValue);
    const { aggregateHistoryData } = useSource({ widgetId, dashboardId, entity, metrics, time });

    const latestEntity = useMemo(() => {
        if (!entity) return {};

        return getLatestEntityDetail(entity);
    }, [entity, getLatestEntityDetail]) as EntityOptionType;

    // Get the percentage value
    const percent = useMemo(() => {
        const { rawData } = latestEntity || {};
        const { entityValueAttribute } = rawData || {};
        const { min, max } = entityValueAttribute || {};
        const { value } = aggregateHistoryData || {};
        if (!value || Number.isNaN(Number(value))) return 0;

        const range = (max || 0) - (min || 0);
        if (range === 0 || value === max) return 100;
        if (!range || value === min) return 0;

        const percent = Math.round(((value - (min || 0)) / range) * 100);
        return Math.min(100, Math.max(0, percent));
    }, [latestEntity, aggregateHistoryData]);

    const { Icon, iconColor } = useMemo(() => {
        const iconType = get(config, 'appearanceIcon.icon', config?.icon);
        const Icon = iconType && Icons[iconType as keyof typeof Icons];
        const iconColor = get(config, 'appearanceIcon.color', config?.iconColor);

        return {
            Icon,
            iconColor,
        };
    }, [config]);

    return (
        <div className={`ms-progress ${isPreview ? 'ms-progress-preview' : ''}`}>
            <div className={cls('ms-progress__header', [matchTablet ? 'mb-1' : 'mb-2'])}>
                <Tooltip autoEllipsis title={title} />
            </div>
            <div className="ms-progress__content">
                <RemainChart Icon={Icon} color={iconColor} percent={percent} showIcon={!oneByOne} />
            </div>
        </div>
    );
};

export default View;
