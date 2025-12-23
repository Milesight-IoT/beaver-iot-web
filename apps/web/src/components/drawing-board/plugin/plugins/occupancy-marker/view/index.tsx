import React, { useRef } from 'react';
import cls from 'classnames';
import { useSize } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    ArabManIcon,
    ArabWomanIcon,
    ToiletCapacityIcon,
    ToiletDisabilityIcon,
} from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { type OccupancyMarkerConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import OccupiedMarker from './OccupiedMarker';
import { useEntities } from './useEntities';
import { useData } from './useData';

import './style.less';

export interface OccupancyMarkerViewProps {
    config: OccupancyMarkerConfigType;
    configJson: BoardPluginProps;
}

const OccupancyMarkerView: React.FC<OccupancyMarkerViewProps> = props => {
    const { config, configJson } = props;
    const { isPreview } = configJson || {};

    const { getIntlText } = useI18n();

    const { entitiesStatus } = useEntities({
        data: config?.markerExtraInfos,
    });
    const {
        markers,
        setMarkers,
        buildingInfo,
        isAvailableToiletCount,
        standardOccupiedToiletCount,
        standardUnoccupiedToiletCount,
        disabilityOccupiedToiletCount,
        disabilityUnoccupiedToiletCount,
        offlineToiletCount,
    } = useData({
        config,
        entitiesStatus,
    });

    const markerContainerRef = useRef<HTMLDivElement>(null);
    const markerContainerSize = useSize(markerContainerRef);

    return (
        <div className="occupancy-marker-view" ref={markerContainerRef}>
            <div className="occupancy-marker-view__header">
                <div
                    className={cls('gender-wrapper', {
                        male: buildingInfo?.basicInfo?.buildingToiletType === 'MALE',
                    })}
                >
                    {buildingInfo?.basicInfo?.buildingToiletType === 'MALE' ? (
                        <ArabManIcon sx={{ width: 20, height: 20 }} />
                    ) : (
                        <ArabWomanIcon sx={{ width: 20, height: 20 }} />
                    )}
                    <span className="gender-wrapper__text">
                        {buildingInfo?.basicInfo?.buildingToiletType === 'MALE'
                            ? getIntlText('common.label.man')
                            : getIntlText('common.label.woman')}
                    </span>
                </div>
                <div className="title">
                    <Tooltip
                        autoEllipsis
                        title={`${buildingInfo?.name || ''} Restroom Occupancy Status`}
                    />
                </div>
                <div className="building-info-statistics">
                    <div className="item">
                        <Tooltip
                            title={
                                isAvailableToiletCount?.unavailable
                                    ? getIntlText('dashboard.tip.available_unavailable_toilet', {
                                          1: isAvailableToiletCount.available,
                                          2: isAvailableToiletCount.unavailable,
                                      })
                                    : null
                            }
                        >
                            <ToiletCapacityIcon sx={{ width: 20, height: 20 }} />
                        </Tooltip>
                        <span className="item__text">
                            {buildingInfo?.basicInfo?.totalToiletCount || 0}
                        </span>
                    </div>
                    <div className="item">
                        <div className="item__block unoccupied" />
                        <span className="item__text">{standardUnoccupiedToiletCount}</span>
                    </div>
                    <div className="item">
                        <div className="item__block occupied" />
                        <span className="item__text">{standardOccupiedToiletCount}</span>
                    </div>
                    <div className="item">
                        <div className="item__block unoccupied">
                            <ToiletDisabilityIcon sx={{ width: 12.5, height: 12.5 }} />
                        </div>
                        <span className="item__text">{disabilityUnoccupiedToiletCount}</span>
                    </div>
                    <div className="item">
                        <div className="item__block occupied">
                            <ToiletDisabilityIcon sx={{ width: 12.5, height: 12.5 }} />
                        </div>
                        <span className="item__text">{disabilityOccupiedToiletCount}</span>
                    </div>
                    <div className="item">
                        <div className="item__block offline" />
                        <span className="item__text">{offlineToiletCount}</span>
                    </div>
                </div>
            </div>

            <OccupiedMarker
                isPreview={isPreview}
                size={markerContainerSize}
                markers={markers}
                setMarkers={setMarkers}
                buildingInfo={buildingInfo}
                markerExtraInfos={config?.markerExtraInfos}
                entitiesStatus={entitiesStatus}
            />
        </div>
    );
};

export default OccupancyMarkerView;
