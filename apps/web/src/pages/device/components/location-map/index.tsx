import React, { memo, useEffect, useMemo, useRef } from 'react';
import cls from 'classnames';
import { Tooltip } from '@mui/material';
import { useMemoizedFn, useThrottleFn } from 'ahooks';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
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
import './style.less';

type OperationState = 'view' | 'edit';

type CustomActionType = 'locate-center';

export interface Props extends MapProps {
    state?: OperationState;

    marker?: LatLng;

    preferZoomLevel?: number;

    onPositionChange?: (position: [number, number]) => void;
}

/**
 * Location map component
 */
const LocationMap: React.FC<Props> = memo(
    ({
        state,
        marker,
        className,
        preferZoomLevel = PREFER_ZOOM_LEVEL,
        onPositionChange,
        ...props
    }) => {
        const { getIntlText } = useI18n();
        const { matchTablet } = useTheme();
        const editing = state === 'edit';

        // ---------- Zoom Control ----------
        const zoomCenterRef = useRef<LatLng>();
        const controlProcessingRef = useRef(false);

        const { run: handleControlClick } = useThrottleFn(
            (type: ZoomControlActionType | CustomActionType, map: MapInstance) => {
                switch (type) {
                    case 'zoom-in': {
                        const nextZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());

                        controlProcessingRef.current = true;
                        // map.setView(zoomCenterRef.current || map.getCenter(), nextZoom);
                        map.setZoom(nextZoom);
                        break;
                    }
                    case 'zoom-out': {
                        const nextZoom = Math.max(map.getZoom() - 1, map.getMinZoom());

                        controlProcessingRef.current = true;
                        // map.setView(zoomCenterRef.current || map.getCenter(), nextZoom);
                        map.setZoom(nextZoom);
                        break;
                    }
                    case 'locate-center': {
                        if (map.getZoom() !== preferZoomLevel) {
                            controlProcessingRef.current = true;
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
        const handlePositionChange = useMemoizedFn((position: [number, number]) => {
            if (!onPositionChange) return;

            // onPositionChange(position);
            onPositionChange([
                formatPrecision(position[0], 6, { resultType: 'number' }),
                formatPrecision(position[1], 6, { resultType: 'number' }),
            ]);
        });
        const events = useMemo<MapProps['events']>(
            () => ({
                click({ target, originalEvent, latlng }) {
                    if (
                        !editing ||
                        (target as MapInstance).getContainer() !== originalEvent.target
                    ) {
                        return;
                    }

                    zoomCenterRef.current = latlng;
                    handlePositionChange([latlng.lat, latlng.lng]);
                },
                moveend(e) {
                    if (!editing || controlProcessingRef.current) {
                        controlProcessingRef.current = false;
                        return;
                    }

                    /**
                     * Note: The moveend event will also be triggered when zooming,
                     * that is, the center of the map will change.
                     */
                    const center = (e.target as MapInstance).getCenter();

                    // console.log('moveend', center);
                    zoomCenterRef.current = center;
                    handlePositionChange([center.lat, center.lng]);
                },
            }),
            [editing, handlePositionChange],
        );

        return (
            <Map
                touchZoom="center"
                scrollWheelZoom="center"
                {...props}
                events={events}
                zoomControl={zoomControl}
                className={cls('ms-com-location-map', className, { 'is-mobile': matchTablet })}
            >
                {!editing && marker && <MapMarker position={marker} />}
                {editing && (
                    <Tooltip
                        // open
                        title={getIntlText('common.message.drag_or_click_to_update_coord')}
                    >
                        <LocationPinIcon className="ms-com-location-map-marker" />
                    </Tooltip>
                )}
            </Map>
        );
    },
);

export default LocationMap;
