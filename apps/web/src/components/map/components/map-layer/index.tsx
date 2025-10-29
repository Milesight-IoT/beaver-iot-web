import { memo, useEffect } from 'react';
import { type LeafletEventHandlerFnMap } from 'leaflet';
import { useMap, useMapEvents, type MapContainerProps } from 'react-leaflet';
import 'proj4leaflet';
import TileLayer, { type TileLayerProps } from '../tile-layer';
import { PREFER_ZOOM_LEVEL } from '../../constants';

interface Props extends TileLayerProps {
    /**
     * Whether to center the map base on the current location
     */
    autoCenterLocate?: boolean | MapContainerProps['center'];

    eventHandlers?: LeafletEventHandlerFnMap;

    /**
     * Location error event handler
     */
    onLocationError?: LeafletEventHandlerFnMap['locationerror'];

    /**
     * Current location found event handler
     */
    onLocationFound?: LeafletEventHandlerFnMap['locationfound'];
}

// const bounds: MarkerProps['position'][] = [
//     [31.59, 120.29],
//     [39.905531, 116.391305],
//     [24.624821056984395, 118.03075790405273],
// ];

/**
 * Map Layer Component
 * @description The component is used for integrating tile layer and map events
 */
const MapLayer = memo(
    ({
        autoCenterLocate,
        eventHandlers = {},
        onLocationError,
        onLocationFound,
        ...props
    }: Props) => {
        const map = useMap();

        useMapEvents({
            locationerror(err) {
                onLocationError?.(err);
            },
            locationfound(e) {
                const { latlng } = e;

                if (autoCenterLocate) {
                    map.flyTo(latlng, PREFER_ZOOM_LEVEL);
                }

                onLocationFound?.(e);
                // map.flyTo(latlng, map.getZoom());
                // map.fitBounds(bounds);
            },
        });

        useMapEvents(eventHandlers);

        useEffect(() => {
            map.locate();
        }, [map]);

        return <TileLayer {...props} />;
    },
);

export default MapLayer;
