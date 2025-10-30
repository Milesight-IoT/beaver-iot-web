import React, { memo, forwardRef, useMemo } from 'react';
import {
    type Map as MapInstance,
    type LeafletEventHandlerFnMap,
    type LatLngExpression as LatLng,
} from 'leaflet';
import { MapContainer, type MapContainerProps } from 'react-leaflet';
import 'proj4leaflet';
import { getTileLayerConfig, type MapTileType } from '@/services/map';
import { DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT, DEFAULT_MAP_CENTER } from './constants';
import { MapLayer, MapZoomControl } from './components';

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
     * Whether to show zoom control or custom zoom control
     */
    zoomControl?: boolean | React.ReactNode;

    /**
     * Map event handlers
     */
    events?: LeafletEventHandlerFnMap;

    /**
     * Map ready event handler
     */
    onReady?: (map: MapInstance) => void;

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
const Map = forwardRef<MapInstance, MapOptions>(
    (
        {
            type = 'openStreet.normal',
            // type = 'tencent.satellite',
            width = DEFAULT_MAP_WIDTH,
            height = DEFAULT_MAP_HEIGHT,
            zoom,
            center,
            children,
            zoomControl = <MapZoomControl />,
            events,
            onReady,
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
                    zoomControl={false}
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
                        eventHandlers={events}
                        onLocationError={onLocationError}
                        onLocationFound={onLocationFound}
                    />
                    {zoomControl}
                    {children}
                </MapContainer>
            </div>
        );
    },
);

export { MapMarker, MapControl, MapZoomControl, type MarkerInstance } from './components';
export { type MapInstance, type LatLng };
export default memo(Map) as typeof Map;
