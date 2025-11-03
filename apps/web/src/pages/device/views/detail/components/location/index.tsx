import React, { useEffect, useRef, useState } from 'react';
import cls from 'classnames';
import { useSize, useDebounceEffect } from 'ahooks';
import { Button } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    EditIcon,
    CheckIcon,
    CloseIcon,
    DeleteOutlineIcon,
    toast,
} from '@milesight/shared/src/components';
import { getGeoLocation } from '@milesight/shared/src/utils/tools';
import {
    Map,
    MapMarker,
    MapZoomControl,
    PREFER_ZOOM_LEVEL,
    useConfirm,
    type LatLng,
    type MapProps,
    type MapInstance,
} from '@/components';
import { awaitWrap, type DeviceAPISchema } from '@/services/http';
import useFormItems, { type LocationType } from './useFormItems';
import './style.less';

type PanelState = 'view' | 'edit' | 'nodata';

type FormDataProps = {
    latitude: number;
    longitude: number;
    address?: string;
};

interface Props {
    /** Loading or not */
    loading?: boolean;

    /** Device details */
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** Edit successful callback */
    onEditSuccess?: () => void | Promise<any>;
}

const Location: React.FC<Props> = ({ loading, data, onEditSuccess }) => {
    const { getIntlText } = useI18n();
    const ref = useRef<HTMLDivElement>(null);
    const size = useSize(ref);
    const [mapInstance, setMapInstance] = useState<MapInstance>();
    const [state, setState] = useState<PanelState>('nodata');
    const editing = state === 'edit';

    const openEditState = async () => {
        setState('edit');

        const [err, latlng] = await awaitWrap(getGeoLocation());

        if (err || !latlng) {
            if (location) {
                mapInstance?.setView([location.latitude, location.longitude], PREFER_ZOOM_LEVEL);
            } else {
                setLocation({ latitude: 0, longitude: 0 });
            }
            // TODO: Toast error message: Failed to get location information
            return;
        }

        if (location) {
            mapInstance?.setView([location.latitude, location.longitude], PREFER_ZOOM_LEVEL);
        } else {
            mapInstance?.setView([latlng.lat, latlng.lng], PREFER_ZOOM_LEVEL);
            setLocation({ latitude: latlng.lat, longitude: latlng.lng });
        }
    };

    // ---------- Form ----------
    const [location, setLocation] = useState<LocationType>();
    const { control, formState, handleSubmit, watch, reset, setValue } = useForm<FormDataProps>({
        mode: 'onChange',
        shouldUnregister: true,
    });
    const formItems = useFormItems();
    const [formLat, formLng] = watch(['latitude', 'longitude']);

    // Edit Save
    const onSubmit: SubmitHandler<FormDataProps> = async formData => {
        console.log({ formData });

        // TODO: Save location

        await onEditSuccess?.();
        setState('view');
        toast.success(getIntlText('common.message.operation_success'));
    };

    // Edit Cancel
    const handleCancel = () => {
        // @ts-ignore TODO: API integration
        const originLocation = data?.location;

        if (!originLocation) {
            setState('nodata');
            setLocation(undefined);
            return;
        }

        setState('view');
        setLocation({ latitude: originLocation.latitude, longitude: originLocation.longitude });
    };

    // Remove location
    const confirm = useConfirm();
    const handleRemove = () => {
        confirm({
            type: 'warning',
            title: getIntlText('common.label.remove'),
            description: getIntlText('device.message.confirm_remove_location'),
            onConfirm: async () => {
                // @ts-ignore TODO: API integration

                await onEditSuccess?.();
                setLocation(undefined);
            },
        });
    };

    // Update form data and panel state when external location data change
    useEffect(() => {
        // @ts-ignore TODO: API integration
        if (!data?.location) {
            setState('nodata');
            setLocation(undefined);
            return;
        }

        setState('view');
        // @ts-ignore TODO: API integration
        setLocation(data.location);
        mapInstance?.setView([data.location.latitude, data.location.longitude], PREFER_ZOOM_LEVEL);
    }, [data, mapInstance]);

    // Update Location when form values change
    useDebounceEffect(
        () => {
            if (!formLat || !formLng || Object.keys(formState.errors).length) return;
            setLocation({ latitude: formLat, longitude: formLng });
            mapInstance?.setView([formLat, formLng]);
        },
        [formLat, formLng, formState.errors],
        { wait: 300 },
    );

    // Update Form Values when location change
    useEffect(() => {
        if (!location?.latitude || !location?.longitude) return;
        setValue('latitude', location.latitude);
        setValue('longitude', location.longitude);
    }, [location, setValue]);

    return (
        <div className="ms-com-device-location" ref={ref}>
            <div className={cls('ms-com-location-edit-panel', `state-${state}`)}>
                {state === 'nodata' && (
                    <div className="edit-panel-nodata">
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => openEditState()}
                        >
                            {getIntlText('device.label.edit_position')}
                        </Button>
                        <div className="empty-tip">
                            {getIntlText('device.message.no_device_location')}
                        </div>
                    </div>
                )}
                {state === 'edit' && (
                    <div className="edit-panel-edit">
                        <div className="edit-panel-edit-header">
                            {getIntlText('device.label.edit_position')}
                        </div>
                        <div className="edit-panel-edit-body">
                            {formItems.map(item => (
                                <Controller key={item.name} control={control} {...item} />
                            ))}
                        </div>
                        <div className="edit-panel-edit-footer">
                            <Button
                                variant="contained"
                                startIcon={<CheckIcon />}
                                onClick={handleSubmit(onSubmit)}
                            >
                                {getIntlText('common.button.save')}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloseIcon />}
                                onClick={handleCancel}
                            >
                                {getIntlText('common.button.cancel')}
                            </Button>
                        </div>
                    </div>
                )}
                {state === 'view' && (
                    <div className="edit-panel-view">
                        <div className="edit-panel-view-body">
                            <ul className="location-detail-list">
                                <li className="location-detail-item">
                                    <div className="location-detail-item-label">
                                        {getIntlText('common.label.latitude')}
                                    </div>
                                    <div className="location-detail-item-value">
                                        {location?.latitude || '-'}
                                    </div>
                                </li>
                                <li className="location-detail-item">
                                    <div className="location-detail-item-label">
                                        {getIntlText('common.label.longitude')}
                                    </div>
                                    <div className="location-detail-item-value">
                                        {location?.longitude || '-'}
                                    </div>
                                </li>
                                <li className="location-detail-item">
                                    <div className="location-detail-item-label">
                                        {getIntlText('common.label.address')}
                                    </div>
                                    <div className="location-detail-item-value">
                                        {location?.address || '-'}
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="edit-panel-view-footer">
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => openEditState()}
                            >
                                {getIntlText('device.label.edit_position')}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DeleteOutlineIcon />}
                                onClick={handleRemove}
                            >
                                {getIntlText('common.label.remove')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {!!size && (
                <Map
                    scrollWheelZoom
                    width={size?.width}
                    height={size?.height}
                    zoomControl={
                        <MapZoomControl
                            locateCenter={
                                !location ? undefined : [location.latitude, location.longitude]
                            }
                        />
                    }
                    events={{
                        click(e) {
                            if (!editing) return;
                            const { latlng } = e;

                            setLocation({
                                ...location,
                                latitude: latlng.lat,
                                longitude: latlng.lng,
                            });
                        },
                    }}
                    onReady={map => setMapInstance(map)}
                >
                    {location && (
                        <MapMarker
                            draggable={editing}
                            position={[location.latitude, location.longitude]}
                            tooltip={
                                !editing
                                    ? ''
                                    : getIntlText('common.message.click_to_mark_and_drag_to_move')
                            }
                            events={{
                                moveend(e) {
                                    const latlng = e.target.getLatLng();

                                    setLocation({
                                        ...location,
                                        latitude: latlng.lat,
                                        longitude: latlng.lng,
                                    });
                                },
                            }}
                        />
                    )}
                </Map>
            )}
        </div>
    );
};

export default Location;
