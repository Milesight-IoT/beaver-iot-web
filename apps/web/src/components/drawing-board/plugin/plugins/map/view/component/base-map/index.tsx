import { useRef, useState } from 'react';
import { useSize, useTimeout } from 'ahooks';
import { Map, MapMarker, type MapInstance, type MarkerInstance, type LatLng } from '@/components';

import DevicePopup from '../device-popup';

const demoData = [
    [31.59, 120.29],
    [39.905531, 116.391305],
    [24.624821056984395, 118.03075790405273],
] as unknown as LatLng[];

const BaseMap = () => {
    const ref = useRef<HTMLDivElement>(null);
    const size = useSize(ref);
    const mapRef = useRef<MapInstance>(null);
    const [markers, setMarkers] = useState<Record<string, MarkerInstance>>({});

    const handleMarkerReady = (key: string, marker: MarkerInstance) => {
        setMarkers(prev => ({ ...prev, [key]: marker }));
    };

    useTimeout(() => {
        const marker = markers[Object.keys(markers)[0]];

        marker?.openPopup();
    }, 3000);

    return (
        <div className="map-plugin-view__map" ref={ref}>
            {size && (
                <Map
                    ref={mapRef}
                    width={size.width}
                    height={size.height}
                    onReady={map => {
                        // console.log(map);
                        // map.fitBounds([
                        //     [31.59, 120.29],
                        //     [39.905531, 116.391305],
                        //     [24.624821056984395, 118.03075790405273],
                        // ]);
                        // setTimeout(() => console.log(map.fitBounds), 0);
                        // console.log(mapRef.current);
                    }}
                    onLocationFound={e => {
                        mapRef.current?.fitBounds(demoData as any, {
                            padding: [20, 20],
                        });
                    }}
                    events={{
                        move(e) {
                            console.log(e);
                        },
                    }}
                >
                    {demoData.map(latLng => (
                        <MapMarker
                            key={latLng.toString()}
                            position={latLng}
                            popup={<DevicePopup />}
                            tooltip={latLng.toString()}
                            onReady={marker => {
                                handleMarkerReady(latLng.toString(), marker);
                            }}
                        />
                    ))}
                </Map>
            )}
        </div>
    );
};

export default BaseMap;
