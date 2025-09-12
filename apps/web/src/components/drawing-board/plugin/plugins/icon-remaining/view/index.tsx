import { useMemo, useRef } from 'react';
import { get, isNil } from 'lodash-es';

import * as Icons from '@milesight/shared/src/components/icons';
import { useTheme } from '@milesight/shared/src/hooks';
import { plus, minus, times, divide } from '@milesight/shared/src/utils/number-precision';

import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { useSource } from './hooks';
import { useGridLayout } from '../../../hooks';
import type { ViewConfigProps } from '../typings';
import type { BoardPluginProps } from '../../../types';
import './style.less';

interface Props {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: BoardPluginProps;
}

/**
 * Get svg real occupy percent
 */
const getRealPercent = (
    svgWrapper: React.RefObject<HTMLDivElement>,
    height: number,
    percent: number,
) => {
    const pathRect = svgWrapper.current
        ?.querySelector('svg')
        ?.firstElementChild?.getBoundingClientRect();
    const wrapperRect = svgWrapper.current?.getBoundingClientRect();
    if (isNil(pathRect) || isNil(wrapperRect)) {
        return 0;
    }

    const padding = minus(pathRect.top, wrapperRect.top);
    const realPercent = divide(
        plus(padding, minus(pathRect.height - times(pathRect.height, times(percent, 0.01)))),
        height,
    );

    return realPercent * 100;
};

const View = (props: Props) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { title, entity, metrics, time } = config || {};
    const { aggregateHistoryData } = useSource({ widgetId, dashboardId, entity, metrics, time });
    const { isPreview, pos } = configJson || {};

    const svgWrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { oneByOne } = useGridLayout(pos);
    const { purple, grey } = useTheme();

    // Get the percentage value
    const percent = useMemo(() => {
        const { rawData } = entity || {};
        const { entityValueAttribute } = rawData || {};
        const { min, max } = entityValueAttribute || {};
        const { value } = aggregateHistoryData || {};
        if (!value) return 0;

        const range = (max || 0) - (min || 0);
        if (range === 0 || value === max) return 100;
        if (!range || value === min) return 0;

        const percent = Math.round((value / range) * 100);
        return Math.min(100, Math.max(0, percent));
    }, [entity, aggregateHistoryData]);

    const { Icon, iconColor } = useMemo(() => {
        const iconType = get(config, 'appearanceIcon.icon', config?.icon);
        const Icon = get(Icons, iconType, Icons.DeleteIcon);
        const iconColor = get(config, 'appearanceIcon.color', config?.iconColor || purple[700]);

        return {
            Icon,
            iconColor,
        };
    }, [config, purple]);

    const getFontsize = () => {
        const containerRect = containerRef?.current?.getBoundingClientRect();
        if (!containerRect) {
            return 124;
        }

        return Math.min(containerRect.width, containerRect.height) - 22;
    };

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
                            height: `${getRealPercent(svgWrapperRef, getFontsize(), percent || 0)}%`,
                        }}
                    >
                        <Icon
                            sx={{
                                color: grey[100],
                                fontSize: `${getFontsize()}px`,
                            }}
                        />
                    </div>
                    <Icon
                        sx={{
                            color: iconColor,
                            fontSize: `${getFontsize()}px`,
                        }}
                    />
                </div>
                <div className="ms-icon-remaining__percent">{percent || 0}%</div>
            </div>
        </div>
    );
};

export default View;
