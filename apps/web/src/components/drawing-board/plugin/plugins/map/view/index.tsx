import React from 'react';

import { Tooltip } from '@/components';
import { useStableValue } from '../../../hooks';
import { BaseMap, Alarm } from './component';

import { type MapConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';

import './style.less';

export interface MapViewProps {
    config: MapConfigType;
    configJson: BoardPluginProps;
}

const MapView: React.FC<MapViewProps> = props => {
    const { config, configJson } = props;
    const { title, devices: unStableValue } = config || {};
    const { isPreview } = configJson || {};

    const { stableValue: devices } = useStableValue(unStableValue);

    return (
        <div className="map-plugin-view">
            {title && <Tooltip className="map-plugin-view__header" autoEllipsis title={title} />}

            <BaseMap />

            <Alarm />
        </div>
    );
};

export default MapView;
