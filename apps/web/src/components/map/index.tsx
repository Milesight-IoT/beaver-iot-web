import React, { memo, useMemo, forwardRef } from 'react';
import { type Map as LeafletMap, type LeafletEventHandlerFnMap, type LatLng } from 'leaflet';
import { MapContainer, type MapContainerProps } from 'react-leaflet';
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
     * Map zoom level
     */
    zoom?: number;

    /**
     * Map center coordinate
     */
    center?: MapContainerProps['center'];

    /**
     * Children elements
     */
    children?: React.ReactNode;

    /**
     * Map ready event handler
     */
    onReady?: (map: LeafletMap) => void;

    /**
     * Map click event handler
     */
    onClick?: LeafletEventHandlerFnMap['click'];

    /**
     * Location error event handler
     */
    onLocationError?: LeafletEventHandlerFnMap['locationerror'];

    /**
     * Current location found event handler
     */
    onLocationFound?: LeafletEventHandlerFnMap['locationfound'];
}

/**
 * Map Component
 */
const Map = forwardRef<LeafletMap, MapOptions>(
    (
        {
            type = 'openStreet.normal',
            // type = 'tencent.satellite',
            width = DEFAULT_MAP_WIDTH,
            height = DEFAULT_MAP_HEIGHT,
            zoom,
            center,
            children,
            onReady,
            onClick,
            onLocationError,
            onLocationFound,
        },
        ref,
    ) => {
        const {
            url,
            tms,
            subdomains,
            attribution,
            coordType,
            zoom: defaultZoom,
            ...configs
        } = useMemo(() => getTileLayerConfig(type), [type]);

        return (
            <div className="ms-map-root">
                <MapContainer
                    {...configs}
                    ref={ref}
                    style={{ width, height }}
                    zoom={zoom ?? defaultZoom}
                    center={center || DEFAULT_MAP_CENTER}
                    scrollWheelZoom={false}
                    // @ts-ignore Has one argument and it's a map instance
                    whenReady={e => {
                        onReady?.(e.target);
                    }}
                    // attributionControl={false}
                >
                    <MapLayer
                        tms={tms}
                        url={url}
                        subdomains={subdomains}
                        attribution={attribution}
                        coordType={coordType}
                        autoCenterLocate={!center}
                        onClick={onClick}
                        onLocationError={onLocationError}
                        onLocationFound={onLocationFound}
                    />
                    {children}
                </MapContainer>
            </div>
        );
    },
);

export { MapMarker, type LeafletMarker } from './components';
export { type LeafletMap, type LatLng };
export default memo(Map) as typeof Map;
