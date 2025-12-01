import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useSize, useMemoizedFn, useDebounceEffect, useLatest } from 'ahooks';
import { isEmpty, get } from 'lodash-es';
import cls from 'classnames';

import Leaf, { type LatLngTuple } from 'leaflet';

import { useTheme } from '@milesight/shared/src/hooks';

import { Map, MapMarker, type MapInstance, type MarkerInstance } from '@/components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { type DeviceDetail } from '@/services/http';
import DevicePopup from '../device-popup';
import { MapContext } from '../../context';
import Alarm from '../alarm';

export interface MapDataProps extends DeviceDetail {
    latLng: LatLngTuple;
}

export interface BaseMapProps {
    title?: string;
    selectDevice?: DeviceDetail | null;
    devices?: DeviceDetail[];
    showMobileSearch?: boolean;
    cancelSelectDevice?: () => void;
}

const BaseMap: React.FC<BaseMapProps> = props => {
    const { title, selectDevice, devices, showMobileSearch, cancelSelectDevice } = props;

    const { matchTablet, matchLandscape } = useTheme();
    const mapContext = useContext(MapContext);
    const { getColorType } = mapContext || {};
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { pluginFullScreen, setOnFullscreen } = pluginFullscreenCxt || {};

    const ref = useRef<HTMLDivElement>(null);
    const size = useSize(ref);
    const mapRef = useRef<MapInstance>(null);
    const currentOpenMarker = useRef<MarkerInstance | null>(null);
    const [markers, setMarkers] = useState<Record<string, MarkerInstance>>({});
    const [mapFixedHeight, setMapFixedHeight] = useState<string | number>();
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const readyTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const [markerPopupStatus, setMarkerPopupStatus] = useState<Record<string, boolean>>({});

    const pluginFullscreenRef = useLatest(pluginFullScreen);
    const matchTabletRef = useLatest(matchTablet);

    /**
     *  Whether the map is operating fullscreen
     */
    const operateFullscreenAndPopupOpen = useRef(false);
    useEffect(() => {
        setOnFullscreen?.(() => {
            return () => {
                operateFullscreenAndPopupOpen.current = !!currentOpenMarker?.current?.isPopupOpen();
            };
        });
    }, [setOnFullscreen]);

    const mapData = useMemo(() => {
        if (!Array.isArray(devices) || isEmpty(devices)) {
            return [];
        }

        return devices
            .filter(d => !!d?.location)
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
    const mapFitBounds = useMemoizedFn((map?: MapInstance) => {
        const currentMap = map || mapRef?.current;
        const latLangs = mapData.map(m => m.latLng);
        if (!Array.isArray(latLangs) || isEmpty(latLangs) || !currentMap) {
            return;
        }

        const leafletId = (currentMap as any)?._container?._leaflet_id;
        if (!leafletId) {
            return;
        }

        currentMap?.fitBounds(latLangs, {
            padding: [20, 20],
        });
    });
    useEffect(() => {
        mapFitBounds?.();
    }, [mapFitBounds, mapData]);

    /**
     * To open select device popup
     */
    useDebounceEffect(
        () => {
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

            /**
             * Set the current open marker
             */
            currentOpenMarker.current = marker;

            /**
             * Pan to marker location to map center with offset
             */
            const markerLatLng = marker?.getLatLng();
            const map = mapRef?.current;
            if (markerLatLng && map) {
                const zoom = map.getZoom();
                const markerPixel = map.project(markerLatLng, zoom);
                const newPixel = markerPixel.add(Leaf.point(0, -102));
                const newLatLng = map.unproject(newPixel, zoom);
                map.panTo(newLatLng, { animate: true });
            }

            /**
             * Delay open popup
             */
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                marker?.openPopup();
            }, 300);
        },
        [selectDevice, markers],
        {
            wait: 300,
        },
    );

    /**
     * Listener popup close
     */
    const handlePopupclose = useMemoizedFn((id: ApiKey) => {
        if (
            selectDevice?.id &&
            id &&
            selectDevice.id === id &&
            !operateFullscreenAndPopupOpen?.current
        ) {
            cancelSelectDevice?.();
        }

        /**
         * Set the operate fullscreen and popup open flag to false
         */
        operateFullscreenAndPopupOpen.current = false;
    });

    const closeMarkerPopup = useMemoizedFn((id: ApiKey) => {
        const marker = get(markers, String(id));
        if (!marker) {
            return;
        }

        marker?.closePopup();
    });

    const getBodyHeight = () => {
        const bodyHeight = document?.body?.getBoundingClientRect()?.height;
        if (!bodyHeight || Number.isNaN(Number(bodyHeight))) {
            return '100%';
        }

        const subtractHeight = title ? 56 : 0;

        return bodyHeight - subtractHeight;
    };

    /**
     * Update map fixed height when plugin fullscreen or match tablet
     */
    useDebounceEffect(
        () => {
            if (!pluginFullScreen || !matchTablet) {
                setMapFixedHeight?.(undefined);
                return;
            }

            setMapFixedHeight?.(getBodyHeight());
        },
        [pluginFullScreen, matchTablet],
        {
            wait: 150,
        },
    );

    /**
     * Update map fixed height when match landscape
     */
    useDebounceEffect(
        () => {
            if (pluginFullscreenRef.current && matchTabletRef.current) {
                setMapFixedHeight?.(getBodyHeight());
            }
        },
        [matchLandscape],
        {
            wait: 150,
        },
    );

    return (
        <div
            style={{
                minHeight: mapFixedHeight,
                height: mapFixedHeight,
                maxHeight: mapFixedHeight,
            }}
            className={cls('map-plugin-view__map', {
                'rounded-none': (!!pluginFullScreen || showMobileSearch) && matchTablet,
                // 'mobile-search-page': showMobileSearch,
            })}
            ref={ref}
        >
            {size && (
                <Map
                    touchZoom="center"
                    scrollWheelZoom="center"
                    ref={mapRef}
                    width={size.width}
                    height={size.height}
                    onReady={map => {
                        if (readyTimeoutRef.current) {
                            clearTimeout(readyTimeoutRef.current);
                        }

                        readyTimeoutRef.current = setTimeout(() => {
                            mapFitBounds?.(map);
                        }, 100);
                    }}
                >
                    {mapData.map(d => (
                        <MapMarker
                            key={d.id}
                            colorType={getColorType?.(d)}
                            position={d.latLng}
                            size={get(markerPopupStatus, String(d?.id), false) ? 'large' : 'small'}
                            popup={<DevicePopup device={d} closeMarkerPopup={closeMarkerPopup} />}
                            onReady={marker => {
                                handleMarkerReady(d.id, marker);
                            }}
                            events={{
                                popupopen: () => {
                                    /**
                                     * Set the marker popup status to true
                                     */
                                    setMarkerPopupStatus(prev => ({
                                        ...prev,
                                        [d.id]: true,
                                    }));
                                },
                                popupclose: () => {
                                    /**
                                     * Set the marker popup status to false
                                     */
                                    setMarkerPopupStatus(prev => ({
                                        ...prev,
                                        [d.id]: false,
                                    }));

                                    handlePopupclose(d.id);
                                },
                            }}
                        />
                    ))}
                </Map>
            )}

            <Alarm />
        </div>
    );
};

export default BaseMap;
