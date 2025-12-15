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
import { OccupiedMarker } from './components';

import './style.less';

export interface OccupancyMarkerViewProps {
    config: OccupancyMarkerConfigType;
    configJson: BoardPluginProps;
}

const OccupancyMarkerView: React.FC<OccupancyMarkerViewProps> = props => {
    const { config, configJson } = props;
    const {
        buildingInfo = {
            key: '112',
            name: 'Building 112',
            basicInfo: {
                buildingToiletType: 'FEMALE',
            },
        },
    } = config || {};
    const { isPreview } = configJson || {};

    const { getIntlText } = useI18n();

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
                        title={`${buildingInfo?.name || ''} Toilet Occupancy Status`}
                    />
                </div>
                <div className="building-info-statistics">
                    <div className="item">
                        <Tooltip title="Total: 12; No data available: 666">
                            <ToiletCapacityIcon sx={{ width: 20, height: 20 }} />
                        </Tooltip>
                        <span className="item__text">136</span>
                    </div>
                    <div className="item">
                        <div className="item__block unoccupied" />
                        <span className="item__text">112</span>
                    </div>
                    <div className="item">
                        <div className="item__block occupied" />
                        <span className="item__text">16</span>
                    </div>
                    <div className="item">
                        <div className="item__block unoccupied">
                            <ToiletDisabilityIcon sx={{ width: 12.5, height: 12.5 }} />
                        </div>
                        <span className="item__text">112</span>
                    </div>
                    <div className="item">
                        <div className="item__block occupied">
                            <ToiletDisabilityIcon sx={{ width: 12.5, height: 12.5 }} />
                        </div>
                        <span className="item__text">16</span>
                    </div>
                    <div className="item">
                        <div className="item__block offline" />
                        <span className="item__text">0</span>
                    </div>
                </div>
            </div>

            <OccupiedMarker isPreview={isPreview} config={config} size={markerContainerSize} />
        </div>
    );
};

export default OccupancyMarkerView;
