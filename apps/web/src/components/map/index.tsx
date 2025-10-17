import React, { memo, useMemo } from 'react';
import { type LeafletEventHandlerFnMap } from 'leaflet';
import { MapContainer, type MapContainerProps, type MarkerProps } from 'react-leaflet';
import 'proj4leaflet';
import { getTileLayerConfig, type MapTileType } from '@/services/map';
import { DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT, DEFAULT_MAP_CENTER } from './constants';
import { MapLayer } from './components';

import './style.less';

interface MapOptions {
    /**
     * Map tile type
     */
    type?: MapTileType;
    /**
     * Map container width
     */
    width?: number;
    /**
     * Map container height
     */
    height?: number;
    /**
     * Map center coordinate
     */
    center?: MapContainerProps['center'];
    /**
     * Map zoom level
     */
    // zoom?: number;

    /**
     * Whether Enable adding markers on the map
     */
    // markable?: boolean;

    markers?: Omit<MarkerProps, 'children' | 'eventHandlers'>[];

    onClick?: LeafletEventHandlerFnMap['click'];
}

const Map: React.FC<MapOptions> = memo(
    ({
        type = 'openStreet.normal',
        // type = 'tencent.satellite',
        width = DEFAULT_MAP_WIDTH,
        height = DEFAULT_MAP_HEIGHT,
        center = DEFAULT_MAP_CENTER,
    }) => {
        const { url, tms, subdomains, attribution, coordType, ...configs } = useMemo(
            () => getTileLayerConfig(type),
            [type],
        );

        return (
            <div className="ms-map-root">
                <MapContainer
                    {...configs}
                    style={{ width, height }}
                    center={center || DEFAULT_MAP_CENTER}
                    // center={[31.59, 120.29]}
                    scrollWheelZoom={false}
                    // attributionControl={false}
                >
                    <MapLayer
                        showMarker
                        tms={tms}
                        url={url}
                        subdomains={subdomains}
                        attribution={attribution}
                        coordType={coordType}
                        autoCenterLocate={!center}
                    />
                </MapContainer>
            </div>
        );
    },
);

export default Map;
