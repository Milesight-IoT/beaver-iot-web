import React, { memo, useMemo, useState, forwardRef } from 'react';
import {
    type Map as MapInstance,
    type LeafletEventHandlerFnMap,
    type LatLngExpression as LatLng,
} from 'leaflet';
import { MapContainer, type MapContainerProps } from 'react-leaflet';
import 'proj4leaflet';
import cls from 'classnames';
import { useDebounceEffect } from 'ahooks';
import { getTileLayerConfig, type MapTileType } from '@/services/map';
import { DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT, DEFAULT_MAP_CENTER } from './constants';
import { MapLayer, MapZoomControl } from './components';

import './style.less';

export interface MapProps {
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
     * Whether the map can be zoomed by using the mouse wheel. If passed 'center',
     * it will zoom to the center of the view regardless of where the mouse was.
     */
    scrollWheelZoom?: MapContainerProps['scrollWheelZoom'];

    /**
     * Whether the map can be zoomed by double clicking on it.
     */
    doubleClickZoom?: MapContainerProps['doubleClickZoom'];

    /**
     * Map center coordinate
     */
    center?: MapContainerProps['center'];

    /**
     * Children elements
     */
    children?: React.ReactNode;

    /**
     * Map container class name
     */
    className?: string;

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
const Map = forwardRef<MapInstance, MapProps>(
    (
        {
            type = 'openStreet.normal',
            // type = 'tencent.satellite',
            width = DEFAULT_MAP_WIDTH,
            height = DEFAULT_MAP_HEIGHT,
            zoom,
            scrollWheelZoom = false,
            doubleClickZoom = false,
            center,
            children,
            className,
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

        // ---------- Auto rerender ---------
        const [mapKey, setMapKey] = useState('');

        useDebounceEffect(
            () => {
                setMapKey(`${width}-${height}`);
            },
            [width, height],
            { wait: 300, leading: true },
        );

        return (
            <div className={cls('ms-map-root', className)}>
                <MapContainer
                    {...configs}
                    worldCopyJump
                    ref={ref}
                    key={mapKey}
                    style={{ width, height }}
                    zoom={zoom ?? defaultZoom}
                    center={center || DEFAULT_MAP_CENTER}
                    zoomControl={false}
                    scrollWheelZoom={scrollWheelZoom}
                    doubleClickZoom={doubleClickZoom}
                    // @ts-ignore Has one argument and it's a map instance
                    whenReady={e => {
                        onReady?.(e.target);
                    }}
                    // attributionControl={false}
                >
                    <MapLayer
                        tms={tms}
                        url={url}
                        minZoom={configs.minZoom}
                        maxZoom={configs.maxZoom}
                        subdomains={subdomains}
                        attribution={attribution}
                        coordType={coordType}
                        autoCenterLocate={!center}
                        events={events}
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

export { useMap, useMapEvent, useMapEvents } from 'react-leaflet';
export { DEFAULT_MAP_CENTER, PREFER_ZOOM_LEVEL } from './constants';
export {
    MapMarker,
    MapControl,
    MapZoomControl,
    type MarkerInstance,
    type ZoomControlActionType,
} from './components';
export { type MapInstance, type LatLng };
export default memo(Map) as typeof Map;
