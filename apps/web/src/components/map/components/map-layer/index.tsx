import { memo, useEffect } from 'react';
import { type LeafletEventHandlerFnMap } from 'leaflet';
import { useMap, useMapEvents, type MapContainerProps } from 'react-leaflet';
import 'proj4leaflet';
import TileLayer, { type TileLayerProps } from '../tile-layer';

interface Props extends Omit<TileLayerProps, 'eventHandlers'> {
    /**
     * Whether to center the map base on the current location
     */
    autoCenterLocate?: boolean | MapContainerProps['center'];

    /**
     * Map events
     */
    events?: LeafletEventHandlerFnMap;

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
 * Map Layer Component
 * @description The component is used for integrating tile layer and map events
 */
const MapLayer = memo(({ events = {}, onLocationError, onLocationFound, ...props }: Props) => {
    const map = useMap();
    const autoFindLocation = !!onLocationFound;

    useMapEvents({
        locationerror(err) {
            onLocationError?.(err);
        },
        locationfound(e) {
            onLocationFound?.(e);
        },
    });

    useMapEvents(events);

    useEffect(() => {
        if (!autoFindLocation) return;

        map.locate();
    }, [map, autoFindLocation]);

    return <TileLayer {...props} />;
});

export default MapLayer;
