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
type SeverityConfig = { type: SeverityType; icon: React.ReactNode };

const severityThresholds = [0.5, 0.8, 1];
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

// TODO: Remove mock data
const mockBuildingInfo: ToiletBuildingProps = {
    key: 'A101',
    name: 'Building 101',
    basicInfo: {
        buildingToiletType: 'MALE',
        totalToiletCount: 120,
        standardToiletCount: 118,
        disabilityToiletCount: 8,
    },
};

const View = ({ config, configJson, widgetId, dashboardId }: ViewProps) => {
    const {
        buildingInfo = mockBuildingInfo,
        actionCanvasId,
        standardOccupiedEntity,
        disabilityOccupiedEntity,
    } = config || {};
    const { name: buildingName, basicInfo: buildingBasicInfo } = buildingInfo || {};
    const { getIntlText } = useI18n();

    // ========== Fetch Occupied Data ==========
    const { data: { standardOccupied, disabilityOccupied } = {}, run: getLatestEntityValues } =
        useRequest(
            async () => {
                const standardEntityId = standardOccupiedEntity?.value;
                const disabilityEntityId = disabilityOccupiedEntity?.value;

                if (!standardEntityId && !disabilityEntityId) return;
                const [error, resp] = await awaitWrap(
                    entityAPI.getEntitiesStatus({
                        entity_ids: [standardEntityId, disabilityEntityId].filter(Boolean),
                    }),
                );

                if (error || !isRequestSuccess(resp)) return;
                const values = getResponseData(resp);
                // eslint-disable-next-line no-unsafe-optional-chaining
                const standardOccupied = isNaN(+values?.[standardEntityId]?.value)
                    ? undefined
                    : Number(values?.[standardEntityId]?.value);
                // eslint-disable-next-line no-unsafe-optional-chaining
                const disabilityOccupied = isNaN(+values?.[disabilityEntityId]?.value)
                    ? undefined
                    : Number(values?.[disabilityEntityId]?.value);

                return { standardOccupied, disabilityOccupied };
            },
            {
                // manual: true,
                debounceWait: 300,
                refreshDeps: [standardOccupiedEntity, disabilityOccupiedEntity],
            },
        );
    const { standard: standardSeverity, disability: disabilitySeverity } = useMemo(() => {
        const result: { standard?: SeverityConfig; disability?: SeverityConfig } = {};

        if (!buildingBasicInfo) return result;
        if (!isNil(standardOccupied)) {
            const standardRatio = standardOccupied / buildingBasicInfo.standardToiletCount;
            const index = severityThresholds.findIndex(threshold => standardRatio <= threshold);
            result.standard = severityConfigs[index];
        }

        if (!isNil(disabilityOccupied)) {
            const disabilityRatio = disabilityOccupied / buildingBasicInfo.disabilityToiletCount;
            const index = severityThresholds.findIndex(threshold => disabilityRatio <= threshold);
            result.disability = severityConfigs[index];
        }

        return result;
    }, [standardOccupied, disabilityOccupied, buildingBasicInfo]);

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

    // ========== Interaction ==========
    const handleNavigate = () => {
        if (!actionCanvasId || configJson?.isPreview) return;
        // TODO: Use `navigateToCanvas` to navigate to the target canvas
        console.log({ actionCanvasId });
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
                        {buildingBasicInfo?.totalToiletCount}
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
                        {!standardOccupiedEntity ? (
                            <span className="placeholder">
                                {getIntlText('dashboard.placeholder.unbound_entity')}
                            </span>
                        ) : (
                            <span className="count">
                                {standardSeverity?.icon}
                                <span className="occupied">
                                    {isNil(standardOccupied) ? '-' : standardOccupied}
                                </span>
                                <span className="total">
                                    /{buildingBasicInfo?.standardToiletCount}
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
                        {!disabilityOccupiedEntity ? (
                            <span className="placeholder">
                                {getIntlText('dashboard.placeholder.unbound_entity')}
                            </span>
                        ) : (
                            <span className="count">
                                {disabilitySeverity?.icon}
                                <span className="occupied">
                                    {isNil(disabilityOccupied) ? '-' : disabilityOccupied}
                                </span>
                                <span className="total">
                                    /{buildingBasicInfo?.disabilityToiletCount}
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
