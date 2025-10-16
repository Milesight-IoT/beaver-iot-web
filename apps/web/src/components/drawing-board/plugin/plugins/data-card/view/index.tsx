import { useMemo } from 'react';
import { get } from 'lodash-es';
import cls from 'classnames';

import { useTheme, useTime } from '@milesight/shared/src/hooks';
import * as Icons from '@milesight/shared/src/components/icons';

import {
    useActivityEntity,
    useGridLayout,
    useContainerRect,
} from '@/components/drawing-board/plugin/hooks';
import { Tooltip } from '@/components';
import { useSource } from './hooks';
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
    const { title, entity } = config || {};
    const { isPreview, pos } = configJson || {};

    const { getTimeFormat } = useTime();
    const { getCSSVariableValue, matchTablet } = useTheme();
    const { getLatestEntityDetail } = useActivityEntity();
    const { wGrid = 2, hGrid = 1 } = useGridLayout(isPreview ? { w: 2, h: 1 } : pos);
    const { containerRef, showIconWidth } = useContainerRect();

    const latestEntity = useMemo(() => {
        if (!entity) return {};

        return getLatestEntityDetail(entity);
    }, [entity, getLatestEntityDetail]) as EntityOptionType;

    const { entityStatus } = useSource({
        entity: latestEntity as EntityOptionType,
        widgetId,
        dashboardId,
    });

    // Current physical real -time data
    const currentEntityData = useMemo(() => {
        const { rawData: currentEntity, value: entityValue } = latestEntity || {};
        if (!currentEntity) return;

        // Get the current selection entity
        const { entityValueAttribute } = currentEntity || {};
        const { enum: enumStruct, unit } = entityValueAttribute || {};
        const currentEntityStatus = entityStatus?.value?.toString();

        // Enumeration type
        if (enumStruct) {
            const currentKey = Object.keys(enumStruct).find(enumKey => {
                return enumKey === currentEntityStatus;
            });
            if (!currentKey) return;

            return {
                label: enumStruct[currentKey],
                value: currentKey,
            };
        }

        // Non -enumeration
        return {
            label: unit ? `${currentEntityStatus ?? '- '}${unit}` : `${currentEntityStatus ?? ''}`,
            value: entityValue,
        };
    }, [latestEntity, entityStatus]);

    // Current physical icon
    const { Icon, iconColor } = useMemo(() => {
        const { value } = currentEntityData || {};
        const iconType = get(config?.icons, `${value}.icon`, config?.[`Icon_${value}`]);
        const Icon = iconType && Icons[iconType as keyof typeof Icons];
        const iconColor = get(config?.icons, `${value}.color`, config?.[`IconColor_${value}`]);

        return {
            Icon,
            iconColor,
        };
    }, [config, currentEntityData]);

    return (
        <div ref={containerRef} className={`data-view ${isPreview ? 'data-view-preview' : ''}`}>
            <div
                className={cls('data-view-card', {
                    'py-0': matchTablet && hGrid <= 1,
                })}
            >
                <div
                    className={cls('data-view-card__content', {
                        'justify-center': hGrid <= 1,
                    })}
                >
                    <div className={cls('data-view-card__header', [matchTablet ? 'mb-1' : 'mb-2'])}>
                        <Tooltip className="data-view-card__title" autoEllipsis title={title} />
                    </div>
                    <div className="data-view-card__body">
                        {Icon && showIconWidth && (
                            <Icon
                                sx={{
                                    color: iconColor || getCSSVariableValue('--gray-5'),
                                    fontSize: hGrid > 1 ? 32 : 24,
                                }}
                            />
                        )}
                        <div
                            className={cls('data-view-card__data', {
                                'text-lg': wGrid > 1 && hGrid > 1,
                                'ms-4': showIconWidth,
                            })}
                        >
                            <Tooltip autoEllipsis title={currentEntityData?.label || '-'} />
                        </div>
                    </div>
                    {hGrid > 1 && (
                        <div className="data-view-card__footer">
                            <Tooltip
                                autoEllipsis
                                title={
                                    entityStatus?.timestamp &&
                                    getTimeFormat(Number(entityStatus.timestamp))
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default View;
