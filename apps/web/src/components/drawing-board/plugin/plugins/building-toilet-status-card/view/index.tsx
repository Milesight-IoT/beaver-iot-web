import React, { useMemo, useEffect } from 'react';
import cls from 'classnames';
import { isNil } from 'lodash-es';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { ArabManIcon, ArabWomanIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import type { BoardPluginProps, ToiletBuildingProps } from '../../../types';
import './style.less';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    // isEdit: boolean;
    config: {
        actionCanvasId?: ApiKey;
        buildingInfo?: ToiletBuildingProps;
        standardOccupiedEntity: EntityOptionType;
        disabilityOccupiedEntity: EntityOptionType;
    };
    configJson: BoardPluginProps;
}

type SeverityType = 'normal' | 'warning' | 'alarm';
type SeverityConfig = { type: SeverityType; desc?: string[] };

const severityThresholds = [0.5, 0.8, 1];
const severityConfigs: SeverityConfig[] = [
    {
        type: 'normal',
        desc: ['Available', ' متاح', 'دستیاب'],
    },
    {
        type: 'warning',
        desc: ['Semi Occupied', 'متوسط الإشغال', 'نیم استعمال'],
    },
    {
        type: 'alarm',
        desc: ['Occupied', 'مشغول', 'استعمال'],
    },
];

const getRatioString = (num: number, total?: number) => {
    if (total === 0 || !total) return '0%';
    return `${((num / total) * 100).toFixed(0)}%`;
};

const View = ({ config, configJson, widgetId, dashboardId }: ViewProps) => {
    const { buildingInfo, standardOccupiedEntity, disabilityOccupiedEntity } = config || {};
    const { name: buildingName, basicInfo: buildingBasicInfo } = buildingInfo || {};
    const { getIntlText } = useI18n();

    // ========== Fetch Occupied Data ==========
    const { data: occupiedCount, run: getLatestEntityValues } = useRequest(
        async () => {
            const standardEntityId = standardOccupiedEntity?.value;
            const disabilityEntityId = disabilityOccupiedEntity?.value;

            if (!standardEntityId || !disabilityEntityId) return;
            const [error, resp] = await awaitWrap(
                entityAPI.getEntitiesStatus({
                    entity_ids: [standardEntityId, disabilityEntityId].filter(Boolean),
                }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const values = getResponseData(resp);
            // eslint-disable-next-line no-unsafe-optional-chaining
            const standardOccupied = isNaN(+values?.[standardEntityId]?.value)
                ? 0
                : Number(values?.[standardEntityId]?.value);
            // eslint-disable-next-line no-unsafe-optional-chaining
            const disabilityOccupied = isNaN(+values?.[disabilityEntityId]?.value)
                ? 0
                : Number(values?.[disabilityEntityId]?.value);

            return standardOccupied + disabilityOccupied;
        },
        {
            debounceWait: 300,
            refreshDeps: [standardOccupiedEntity, disabilityOccupiedEntity],
        },
    );
    const severity = useMemo(() => {
        if (!buildingBasicInfo || isNil(occupiedCount)) return;
        const ratio = occupiedCount / buildingBasicInfo.totalToiletCount;
        const index = severityThresholds.findIndex(threshold => ratio <= threshold);
        return severityConfigs[index];
    }, [occupiedCount, buildingBasicInfo]);

    // ========== Entity Status Listener ==========
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const standardEntityId = standardOccupiedEntity?.value;
        const disabilityEntityId = disabilityOccupiedEntity?.value;
        if (!widgetId || !dashboardId || (!standardEntityId && !disabilityEntityId)) return;

        const removeEventListener = addEntityListener(
            [standardEntityId, disabilityEntityId].filter(Boolean),
            {
                widgetId,
                dashboardId,
                callback: getLatestEntityValues,
            },
        );

        return () => {
            removeEventListener();
        };
    }, [
        widgetId,
        dashboardId,
        standardOccupiedEntity,
        disabilityOccupiedEntity,
        addEntityListener,
        getLatestEntityValues,
    ]);

    return (
        <div
            className={cls('ms-building-toilet-status-card-view', {
                'is-preview': configJson?.isPreview,
            })}
        >
            <div className="ms-building-toilet-status-card-view-header">
                <div className="title">
                    <Tooltip autoEllipsis title={buildingName} />
                </div>
            </div>
            <div className={cls('ms-building-toilet-status-card-view-content', severity?.type)}>
                <div className="desc">{severity?.desc?.map(txt => <p key={txt}>{txt}</p>)}</div>
                <div className="detail">
                    <div className="category">
                        {buildingBasicInfo?.buildingToiletType === 'FEMALE' ? (
                            <ArabWomanIcon />
                        ) : (
                            <ArabManIcon />
                        )}
                    </div>
                    <div className={cls('count', { 'is-placeholder': isNil(occupiedCount) })}>
                        {isNil(occupiedCount)
                            ? getIntlText('dashboard.placeholder.unbound_entity')
                            : getRatioString(occupiedCount, buildingBasicInfo?.totalToiletCount)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default View;
