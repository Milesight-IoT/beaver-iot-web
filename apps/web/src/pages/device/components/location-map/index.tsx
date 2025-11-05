import React, { memo, useMemo, useRef } from 'react';
import cls from 'classnames';
import { Tooltip } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
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

    onPositionChange?: (position: [number, number]) => void;
}

/**
 * Location map component
 */
const LocationMap: React.FC<Props> = memo(
    ({ state, marker, className, onPositionChange, ...props }) => {
        const { getIntlText } = useI18n();
        const { matchTablet } = useTheme();
        const editing = state === 'edit';

        // ---------- Zoom Control ----------
        const zoomCenterRef = useRef<LatLng>();

        const handleControlClick = useMemoizedFn(
            (type: ZoomControlActionType | CustomActionType, map: MapInstance) => {
                switch (type) {
                    case 'zoom-in': {
                        const nextZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());
                        map.setView(zoomCenterRef.current || map.getCenter(), nextZoom);
                        break;
                    }
                    case 'zoom-out': {
                        const nextZoom = Math.max(map.getZoom() - 1, map.getMinZoom());
                        map.setView(zoomCenterRef.current || map.getCenter(), nextZoom);
                        break;
                    }
                    case 'locate-center': {
                        map.setView(zoomCenterRef.current || map.getCenter(), PREFER_ZOOM_LEVEL);
                        break;
                    }
                    default: {
                        break;
                    }
                }

                return true;
            },
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

        // ---------- Map Events ----------
        const handlePositionChange = useMemoizedFn(onPositionChange || (() => {}));
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
                zoomend(e) {
                    if (!editing) return;
                    const center = (e.target as MapInstance).getCenter();

                    zoomCenterRef.current = center;
                    handlePositionChange([center.lat, center.lng]);
                },
                moveend(e) {
                    if (!editing) return;
                    const center = (e.target as MapInstance).getCenter();

                    zoomCenterRef.current = center;
                    handlePositionChange([center.lat, center.lng]);
                },
            }),
            [editing, handlePositionChange],
        );

        return (
            <Map
                scrollWheelZoom
                {...props}
                events={events}
                zoomControl={zoomControl}
                className={cls('ms-com-location-map', className, { 'is-mobile': matchTablet })}
            >
                {!editing && marker && <MapMarker position={marker} />}
                {editing && (
                    <Tooltip title={getIntlText('common.message.click_to_mark_and_drag_to_move')}>
                        <LocationPinIcon className="ms-com-location-map-marker" />
                    </Tooltip>
                )}
            </Map>
        );
    },
);

export default LocationMap;
