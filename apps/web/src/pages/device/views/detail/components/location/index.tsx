import { useRef } from 'react';
import { useSize } from 'ahooks';
import { Map, MapMarker, type LeafletMap, type LatLng } from '@/components';
import './style.less';

const demoData = [
    [31.59, 120.29],
    [39.905531, 116.391305],
    [24.624821056984395, 118.03075790405273],
] as unknown as LatLng[];

const Location = () => {
    const ref = useRef<HTMLDivElement>(null);
    const size = useSize(ref);
    const mapRef = useRef<LeafletMap>(null);

    return (
        <div className="ms-com-device-location" ref={ref}>
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
                >
                    {demoData.map(latlng => (
                        <MapMarker key={latlng.toString()} position={latlng} />
                    ))}
                </Map>
            )}
        </div>
    );
};

export default Location;
