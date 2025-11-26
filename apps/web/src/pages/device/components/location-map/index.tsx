import React, {
    useEffect,
    useMemo,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from 'react';
import cls from 'classnames';
import { Tooltip } from '@mui/material';
import { useThrottleFn } from 'ahooks';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { isAppleDevice } from '@milesight/shared/src/utils/userAgent';
import { formatPrecision } from '@milesight/shared/src/utils/tools';
import { MyLocationIcon, LocationPinIcon } from '@milesight/shared/src/components';
import {
    Map,
    MapMarker,
    MapZoomControl,
    PREFER_ZOOM_LEVEL,
    type MapProps,
    type MapInstance,
    type LatLng,
    type ZoomControlActionType,
} from '@/components';
import { DEVICE_LOCATION_PRECISION } from '../../constants';
import './style.less';

type OperationState = 'view' | 'edit';

type CustomActionType = 'locate-center';

export interface Props extends MapProps {
    state?: OperationState;

    marker?: LatLng;

    preferZoomLevel?: number;

    onPositionChange?: (position: [number, number]) => void;
}

export interface LocationMapRef {
    setPosition: (position: [number, number], zoomLevel?: number) => void;
}

/**
 * Location map component
 */
const LocationMap = (
    {
        width,
        height,
        state,
        marker,
        className,
        preferZoomLevel = PREFER_ZOOM_LEVEL,
        onPositionChange,
        ...props
    }: Props,
    ref?: React.ForwardedRef<LocationMapRef>,
) => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();
    const editing = state === 'edit';

    // ---------- Zoom Control ----------
    const zoomCenterRef = useRef<LatLng>();
    const preventMoveEventRef = useRef(false);

    const { run: handleControlClick } = useThrottleFn(
        (type: ZoomControlActionType | CustomActionType, map: MapInstance) => {
            switch (type) {
                case 'zoom-in': {
                    const nextZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());

                    preventMoveEventRef.current = true;
                    map.setView(zoomCenterRef.current || map.getCenter(), nextZoom);
                    break;
                }
                case 'zoom-out': {
                    const nextZoom = Math.max(map.getZoom() - 1, map.getMinZoom());

                    preventMoveEventRef.current = true;
                    map.setView(zoomCenterRef.current || map.getCenter(), nextZoom);
                    break;
                }
                case 'locate-center': {
                    if (map.getZoom() !== preferZoomLevel) {
                        preventMoveEventRef.current = true;
                    }
                    map.setView(zoomCenterRef.current || map.getCenter(), preferZoomLevel);
                    break;
                }
                default: {
                    break;
                }
            }

            return true;
        },
        { wait: 300 },
    );
    const zoomControl = useMemo<React.ReactNode>(
        () => (
            <MapZoomControl<CustomActionType>
                actions={[{ type: 'locate-center', icon: <MyLocationIcon /> }]}
                onButtonClick={handleControlClick}
            />
        ),
        [handleControlClick],
    );

    useEffect(() => {
        if (editing) return;
        zoomCenterRef.current = marker;
    }, [editing, marker]);

    // ---------- Map Events ----------
    const { run: handlePositionChange } = useThrottleFn(
        (position: [number, number]) => {
            if (!onPositionChange) return;
            const formatConfig = {
                round: false,
                resultType: 'number',
                precision: DEVICE_LOCATION_PRECISION,
            } as const;

            // onPositionChange(position);
            onPositionChange([
                formatPrecision(position[0], formatConfig),
                formatPrecision(position[1], formatConfig),
            ]);
        },
        { wait: 350 },
    );
    const events = useMemo<MapProps['events']>(
        () => ({
            click({ target, originalEvent, latlng }) {
                if (!editing || (target as MapInstance).getContainer() !== originalEvent.target) {
                    return;
                }

                zoomCenterRef.current = latlng;
                handlePositionChange([latlng.lat, latlng.lng]);
            },
            moveend(e) {
                if (!editing || preventMoveEventRef.current) {
                    preventMoveEventRef.current = false;
                    return;
                }
                const map = e.target as MapInstance;

                /**
                 * Note: The moveend event will also be triggered when zooming,
                 * that is, the center of the map will change.
                 */
                const center = map.getCenter();

                // console.log('moveend', center);
                zoomCenterRef.current = center;
                handlePositionChange([center.lat, center.lng]);
            },
            // @ts-ignore Extend the ScrollWheelZoom class of Leaflet
            scrollwheelzoom({ target, nextZoom }) {
                const map = target as MapInstance;
                preventMoveEventRef.current = true;
                map.setView(
                    !editing ? map.getCenter() : zoomCenterRef.current || map.getCenter(),
                    nextZoom,
                );
            },
        }),
        [editing, handlePositionChange],
    );

    // ---------- Marker Tooltip ----------
    const [tooltipOpen, setTooltipOpen] = useState(false);

    useEffect(() => {
        if (!editing) return;

        setTooltipOpen(true);
        const timer = setTimeout(() => {
            setTooltipOpen(false);
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [editing]);

    // ---------- Expose functions ----------
    // const [mapInstance, setMapInstance] = useState<MapInstance>();
    const mapInstanceRef = useRef<MapInstance | null>(null);
    useImperativeHandle(ref, () => ({
        setPosition(position, zoom) {
            const map = mapInstanceRef.current;
            if (!map || !position) return;

            zoomCenterRef.current = position;
            preventMoveEventRef.current = true;
            map.setView(position, zoom);
        },
    }));

    // ---------- Map Size ----------
    const size = useMemo<React.CSSProperties>(() => {
        if (!width || !height) return {};
        /**
         * Ensure the map size is even number to reduce the Marker jitter issue
         * caused by 0.5px.
         */
        return {
            width: width % 2 === 0 ? width : width + 1,
            height: height % 2 === 0 ? height : height + 1,
        };
    }, [width, height]);

    return (
        <Map
            touchZoom="center"
            // @ts-ignore Extend the ScrollWheelZoom class of Leaflet
            scrollWheelZoom="custom"
            {...props}
            {...size}
            ref={mapInstanceRef}
            events={events}
            zoomControl={zoomControl}
            className={cls('ms-com-location-map', className, { 'is-mobile': matchTablet })}
        >
            {!editing && marker && <MapMarker position={marker} />}
            {editing && (
                <Tooltip
                    open={tooltipOpen}
                    title={getIntlText('common.message.drag_or_click_to_update_coord')}
                    onClose={() => setTooltipOpen(false)}
                    onOpen={() => setTooltipOpen(true)}
                >
                    <LocationPinIcon
                        className={cls('ms-com-location-map-marker', {
                            'is-apple': isAppleDevice(),
                        })}
                    />
                </Tooltip>
            )}
        </Map>
    );
};

const ForwardLocationMap = forwardRef<LocationMapRef, Props>(LocationMap);

export default ForwardLocationMap;
