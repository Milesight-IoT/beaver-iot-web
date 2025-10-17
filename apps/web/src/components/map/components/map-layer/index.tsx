import React, { memo, useState, useEffect } from 'react';
import { type LeafletEventHandlerFnMap } from 'leaflet';
import {
    Marker,
    useMap,
    useMapEvents,
    type MarkerProps,
    type MapContainerProps,
} from 'react-leaflet';
import 'proj4leaflet';
import TileLayer, { type TileLayerProps } from '../tile-layer';

interface Props extends TileLayerProps {
    showMarker?: boolean;

    autoCenterLocate?: boolean | MapContainerProps['center'];

    markers?: Omit<MarkerProps, 'children' | 'eventHandlers'>[];

    onClick?: LeafletEventHandlerFnMap['click'];
}

const MapLayer = memo(({ showMarker, autoCenterLocate, ...props }: Props) => {
    const map = useMap();
    const [position, setPosition] = useState<MapContainerProps['center'] | null>(null);

    useMapEvents({
        // click(e) {
        //     const { latlng } = e;
        //     const result = gcj2wgsExact(latlng.lat, latlng.lng);
        //     console.log({ latlng, result });

        //     setPosition(latlng);
        //     onLocationFound?.(latlng);
        //     map.flyTo(latlng, map.getZoom());
        // },
        locationfound(e) {
            const { latlng } = e;
            // const result = wgs2gcj(latlng.lat, latlng.lng);

            // console.log({ latlng, result });
            setPosition(latlng);
            // onLocationFound?.(latlng);
            map.flyTo(latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.locate();
    }, [map]);

    return (
        <>
            <TileLayer {...props} />
            {!position || !showMarker ? null : <Marker position={position} />}
        </>
    );
});

export default MapLayer;
