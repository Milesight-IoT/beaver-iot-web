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
    const { getCSSVariableValue } = useTheme();
    const { getLatestEntityDetail } = useActivityEntity();
    const { twoByTwo, oneByTwo, twoByOne, oneByOne } = useGridLayout(
        isPreview ? { w: 2, h: 1 } : pos,
    );
    const { containerRef, showIconWidth } = useContainerRect();

    const latestEntity = useMemo(() => {
        if (!entity) return {};

        return getLatestEntityDetail(entity);
    }, [entity, getLatestEntityDetail]) as EntityOptionType;

    const { entityStatusValue } = useSource({
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
        const currentEntityStatus = entityStatusValue?.toString();

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
    }, [latestEntity, entityStatusValue]);

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
            <div className="data-view-card">
                <div
                    className={cls('data-view-card__content', {
                        'justify-center': twoByOne || oneByOne,
                    })}
                >
                    {(twoByTwo || oneByTwo) && (
                        <div className="data-view-card__header">
                            <Tooltip className="data-view-card__title" autoEllipsis title={title} />
                        </div>
                    )}
                    <div className="data-view-card__body">
                        {Icon && showIconWidth && (
                            <Icon
                                sx={{
                                    color: iconColor || getCSSVariableValue('--gray-5'),
                                    fontSize: 32,
                                }}
                            />
                        )}
                        <div
                            className={cls('data-view-card__data', {
                                'text-lg': twoByTwo,
                                'ms-4': showIconWidth,
                            })}
                        >
                            {(twoByOne || oneByOne) && <Tooltip autoEllipsis title={title} />}
                            <Tooltip autoEllipsis title={currentEntityData?.label || '-'} />
                        </div>
                    </div>
                    {(twoByTwo || oneByTwo) && (
                        <div className="data-view-card__footer">
                            <Tooltip
                                autoEllipsis
                                title={
                                    entity?.rawData?.entityUpdatedAt &&
                                    getTimeFormat(entity.rawData.entityUpdatedAt)
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
