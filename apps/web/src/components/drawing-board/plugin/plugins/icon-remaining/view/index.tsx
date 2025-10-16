import { useMemo } from 'react';
import { get } from 'lodash-es';

import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';

import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { useSource, useIconRemaining } from './hooks';
import { useActivityEntity, useStableValue } from '../../../hooks';
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
    const { isPreview } = configJson || {};

    const { purple, grey } = useTheme();
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

    const { svgWrapperRef, containerRef, realPercent, newFontSize } = useIconRemaining(percent);

    const { Icon, iconColor } = useMemo(() => {
        const iconType = get(config, 'appearanceIcon.icon', config?.icon);
        const Icon = get(Icons, iconType, Icons.DeleteIcon);
        const iconColor = get(config, 'appearanceIcon.color', config?.iconColor || purple[700]);

        return {
            Icon,
            iconColor,
        };
    }, [config, purple]);

    return (
        <div className={`ms-icon-remaining ${isPreview ? 'ms-icon-remaining-preview' : ''}`}>
            <div className="ms-icon-remaining__header">
                <Tooltip autoEllipsis title={title} />
            </div>
            <div ref={containerRef} className="ms-icon-remaining__content">
                <div className="ms-icon-remaining__icon">
                    <div
                        ref={svgWrapperRef}
                        className="ms-icon-remaining__icon-fake"
                        style={{
                            height: `${realPercent}%`,
                        }}
                    >
                        <Icon
                            sx={{
                                color: grey[100],
                                fontSize: `${newFontSize}px`,
                            }}
                        />
                    </div>
                    <Icon
                        sx={{
                            color: iconColor,
                            fontSize: `${newFontSize}px`,
                        }}
                    />
                </div>
                <div className="ms-icon-remaining__percent">{percent || 0}%</div>
            </div>
        </div>
    );
};

export default View;
