import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSize, useMemoizedFn } from 'ahooks';
import { isEmpty, get } from 'lodash-es';

import { type LatLngTuple } from 'leaflet';

import { Map, MapMarker, type MapInstance, type MarkerInstance } from '@/components';
import { type DeviceDetail } from '@/services/http';
import DevicePopup from '../device-popup';

export interface MapDataProps extends DeviceDetail {
    latLng: LatLngTuple;
}

export interface BaseMapProps {
    selectDevice?: DeviceDetail | null;
    devices?: DeviceDetail[];
    cancelSelectDevice?: () => void;
}

const BaseMap: React.FC<BaseMapProps> = props => {
    const { selectDevice, devices, cancelSelectDevice } = props;

    const ref = useRef<HTMLDivElement>(null);
    const size = useSize(ref);
    const mapRef = useRef<MapInstance>(null);
    const isInitialFit = useRef(false);
    const currentOpenMarker = useRef<MarkerInstance | null>(null);
    const isComponentDestroy = useRef(false);
    const [markers, setMarkers] = useState<Record<string, MarkerInstance>>({});

    const mapData = useMemo(() => {
        if (!Array.isArray(devices) || isEmpty(devices)) {
            return [];
        }

        return devices
            .filter(d => !!d.location)
            .map(d => {
                return {
                    ...d,
                    latLng: [d.location?.latitude, d.location?.longitude],
                };
            }) as MapDataProps[];
    }, [devices]);

    const handleMarkerReady = (key: ApiKey, marker: MarkerInstance) => {
        setMarkers(prev => ({ ...prev, [key]: marker }));
    };

    /**
     * Map fit bounds
     */
    const mapFitBounds = useMemoizedFn(() => {
        const latLangs = mapData.map(m => m.latLng);
        if (!Array.isArray(latLangs) || isEmpty(latLangs) || !mapRef?.current) {
            return;
        }

        mapRef.current?.fitBounds(latLangs, {
            padding: [20, 20],
        });
        isInitialFit.current = true;
    });
    useEffect(() => {
        mapFitBounds?.();
    }, [mapFitBounds, mapData]);

    /**
     * To open select device popup
     */
    useEffect(() => {
        const marker = get(markers, String(selectDevice?.id));
        if (!marker) {
            /**
             * Close the popup that was previously opened
             */
            if (!selectDevice?.id && currentOpenMarker.current?.isPopupOpen()) {
                currentOpenMarker.current?.closePopup();
                currentOpenMarker.current = null;
            }

            return;
        }

        marker?.openPopup();
        currentOpenMarker.current = marker;
    }, [selectDevice, markers]);

    /**
     * Listener popup close
     */
    const handlePopupclose = useMemoizedFn((id: ApiKey) => {
        if (selectDevice?.id && id && selectDevice.id === id && !isComponentDestroy?.current) {
            cancelSelectDevice?.();
        }
    });

    /**
     * Component destroy
     */
    useEffect(() => {
        isComponentDestroy.current = false;

        return () => {
            isComponentDestroy.current = true;
        };
    }, []);

    return (
        <div className="map-plugin-view__map" ref={ref}>
            {size && (
                <Map
                    ref={mapRef}
                    width={size.width}
                    height={size.height}
                    onReady={() => {
                        if (isInitialFit.current) {
                            return;
                        }

                        mapFitBounds();
                    }}
                >
                    {mapData.map(d => (
                        <MapMarker
                            key={d.id}
                            position={d.latLng}
                            popup={<DevicePopup device={d} />}
                            onReady={marker => {
                                handleMarkerReady(d.id, marker);
                            }}
                            events={{
                                popupclose: () => {
                                    handlePopupclose(d.id);
                                },
                            }}
                        />
                    ))}
                </Map>
            )}
        </div>
    );
};

export default BaseMap;
