import React, { useMemo, useEffect } from 'react';
import cls from 'classnames';
import { isNil } from 'lodash-es';
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    ArabManIcon,
    ArabWomanIcon,
    CheckCircleOutlineIcon,
    KeyboardArrowRightIcon,
    PriorityHighIcon,
    ToiletCapacityIcon,
    ToiletDisabilityIcon,
} from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import useDashboardStore from '@/pages/dashboard/store';
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
        standardIdleEntity: EntityOptionType;
        disabilityIdleEntity: EntityOptionType;
    };
    configJson: BoardPluginProps;
}

type SeverityType = 'normal' | 'warning' | 'alarm';
type SeverityConfig = { type: SeverityType; icon: React.ReactNode };

const severityThresholds = [0.5, 0.8, Infinity];
const severityConfigs: SeverityConfig[] = [
    {
        type: 'normal',
        icon: <CheckCircleOutlineIcon />,
    },
    {
        type: 'warning',
        icon: <PriorityHighIcon />,
    },
    {
        type: 'alarm',
        icon: (
            <span className="alarm-icon">
                <PriorityHighIcon />
                <PriorityHighIcon />
            </span>
        ),
    },
];

// Mock data
// const mockBuildingInfo: ToiletBuildingProps = {
//     key: 'A101',
//     name: 'Building 101',
//     basicInfo: {
//         toiletsLayout: 'LAYOUT_120',
//         buildingToiletType: 'MALE',
//         totalToiletCount: 120,
//         standardToiletCount: 118,
//         disabilityToiletCount: 8,
//     },
// };

const View = ({ config, configJson, widgetId, dashboardId }: ViewProps) => {
    const { buildingInfo, actionCanvasId, standardIdleEntity, disabilityIdleEntity } = config || {};
    const { name: buildingName, basicInfo: buildingBasicInfo } = buildingInfo || {};
    const { getIntlText } = useI18n();

    // ========== Fetch Idle Data ==========
    const { data: { standardIdle, disabilityIdle } = {}, run: getLatestEntityValues } = useRequest(
        async () => {
            const standardEntityId = standardIdleEntity?.value;
            const disabilityEntityId = disabilityIdleEntity?.value;

            if (!standardEntityId && !disabilityEntityId) return;
            const [error, resp] = await awaitWrap(
                entityAPI.getEntitiesStatus({
                    entity_ids: [standardEntityId, disabilityEntityId].filter(Boolean),
                }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const values = getResponseData(resp);
            // eslint-disable-next-line no-unsafe-optional-chaining
            const standardIdle = isNaN(+values?.[standardEntityId]?.value)
                ? undefined
                : Number(values?.[standardEntityId]?.value);
            // eslint-disable-next-line no-unsafe-optional-chaining
            const disabilityIdle = isNaN(+values?.[disabilityEntityId]?.value)
                ? undefined
                : Number(values?.[disabilityEntityId]?.value);

            return { standardIdle, disabilityIdle };
        },
        {
            // manual: true,
            debounceWait: 300,
            refreshDeps: [standardIdleEntity, disabilityIdleEntity],
        },
    );
    const { standard: standardSeverity, disability: disabilitySeverity } = useMemo(() => {
        const result: { standard?: SeverityConfig; disability?: SeverityConfig } = {};

        if (!buildingBasicInfo) return result;
        if (!isNil(standardIdle)) {
            const standardTotal = buildingBasicInfo.standardToiletCount;
            const standardRatio = (standardTotal - standardIdle) / standardTotal;
            const index = severityThresholds.findIndex(threshold => standardRatio <= threshold);
            result.standard = severityConfigs[index];
        }

        if (!isNil(disabilityIdle)) {
            const disabilityTotal = buildingBasicInfo.disabilityToiletCount;
            const disabilityRatio = (disabilityTotal - disabilityIdle) / disabilityTotal;
            const index = severityThresholds.findIndex(threshold => disabilityRatio <= threshold);
            result.disability = severityConfigs[index];
        }

        return result;
    }, [standardIdle, disabilityIdle, buildingBasicInfo]);

    // ========== Entity Status Listener ==========
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const standardEntityId = standardIdleEntity?.value;
        const disabilityEntityId = disabilityIdleEntity?.value;
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
        standardIdleEntity,
        disabilityIdleEntity,
        addEntityListener,
        getLatestEntityValues,
    ]);

    // ========== Interaction ==========
    const { navigateToCanvas } = useDashboardStore();
    const handleNavigate = () => {
        if (!actionCanvasId || configJson?.isPreview) return;
        navigateToCanvas({ id: actionCanvasId });
    };

    return (
        <div
            className={cls('ms-building-toilet-card-view', {
                simple: !!actionCanvasId,
                'is-preview': configJson?.isPreview,
            })}
        >
            <div className="ms-building-toilet-card-view-header">
                <div
                    className={cls('title', { 'is-link': !!actionCanvasId })}
                    onClick={handleNavigate}
                >
                    <Tooltip autoEllipsis title={buildingName} />
                    <KeyboardArrowRightIcon />
                </div>
                <div className="detail">
                    <span className="count">
                        <ToiletCapacityIcon />
                        {buildingBasicInfo?.totalToiletCount || '-'}
                    </span>
                </div>
            </div>
            <div className="ms-building-toilet-card-view-content">
                <div className={cls('toilet-info-card', standardSeverity?.type)}>
                    <div className="category">
                        {buildingBasicInfo?.buildingToiletType === 'FEMALE' ? (
                            <ArabWomanIcon />
                        ) : (
                            <ArabManIcon />
                        )}
                    </div>
                    <div className="detail">
                        {!standardIdleEntity ? (
                            <span className="placeholder">
                                {getIntlText('dashboard.placeholder.unbound_entity')}
                            </span>
                        ) : (
                            <span className="count">
                                {standardSeverity?.icon}
                                <span className="idle">
                                    {isNil(standardIdle) ? '-' : standardIdle}
                                </span>
                                <span className="total">
                                    /{buildingBasicInfo?.standardToiletCount || '-'}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
                <div className={cls('toilet-info-card', disabilitySeverity?.type)}>
                    <div className="category">
                        <ToiletDisabilityIcon />
                    </div>
                    <div className="detail">
                        {!disabilityIdleEntity ? (
                            <span className="placeholder">
                                {getIntlText('dashboard.placeholder.unbound_entity')}
                            </span>
                        ) : (
                            <span className="count">
                                {disabilitySeverity?.icon}
                                <span className="idle">
                                    {isNil(disabilityIdle) ? '-' : disabilityIdle}
                                </span>
                                <span className="total">
                                    /{buildingBasicInfo?.disabilityToiletCount || '-'}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default View;
