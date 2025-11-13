import React, { useEffect, useRef, useState, useCallback } from 'react';
import cls from 'classnames';
import { useSize, useDebounceEffect } from 'ahooks';
import { Button, CircularProgress } from '@mui/material';
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
import { PermissionControlHidden, useConfirm, type MapInstance } from '@/components';
import {
    deviceAPI,
    awaitWrap,
    isRequestSuccess,
    type DeviceAPISchema,
    type LocationType,
} from '@/services/http';
import { PERMISSIONS } from '@/constants';
import useLocationFormItems from '@/pages/device/hooks/useLocationFormItems';
import { LocationMap, type LocationMapProps } from '@/pages/device/components';
import './style.less';

type PanelState = 'view' | 'edit' | 'nodata';

interface Props {
    /** Loading or not */
    loading?: boolean;

    /** Device details */
    data?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;

    /** Edit successful callback */
    onEditSuccess?: () => void | Promise<any>;
}

const PREFER_ZOOM_LEVEL = 16;

const Location: React.FC<Props> = ({ data, onEditSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Panel State ----------
    const [state, setState] = useState<PanelState>('nodata');
    const editing = state === 'edit';

    const openEditState = async () => {
        setState('edit');

        if (location) {
            mapInstance?.setView([location.latitude, location.longitude], PREFER_ZOOM_LEVEL);
            return;
        }

        const [err, latlng] = await awaitWrap(getGeoLocation());

        if (err || !latlng) {
            setLocation({ latitude: 0, longitude: 0 });
            toast.error(getIntlText('device.message.get_location_failed'));
            return;
        }

        setLocation({ latitude: latlng.lat, longitude: latlng.lng });
        mapInstance?.setView([latlng.lat, latlng.lng], PREFER_ZOOM_LEVEL);
    };

    // ---------- Map ----------
    const rootRef = useRef<HTMLDivElement>(null);
    const size = useSize(rootRef);
    const [mapInstance, setMapInstance] = useState<MapInstance>();

    // ---------- Form Items and Actions ----------
    const [loading, setLoading] = useState(false);
    const { control, formState, handleSubmit, watch, reset, setValue, getValues } =
        useForm<LocationType>({
            mode: 'onChange',
            shouldUnregister: true,
        });
    const formItems = useLocationFormItems();
    const [formLat, formLng] = watch(['latitude', 'longitude']);

    // Edit Save
    const onSubmit: SubmitHandler<LocationType> = async () => {
        if (!data?.id) return;
        const formData = getValues();

        // console.log({ formData, location });
        setLoading(true);
        const [err, res] = await awaitWrap(
            deviceAPI.setLocation({
                id: data.id,
                ...formData,
            }),
        );

        setLoading(false);
        if (err || !isRequestSuccess(res)) return;

        await onEditSuccess?.();
        setState('view');
        toast.success(getIntlText('common.message.operation_success'));
    };

    // Edit Cancel
    const handleCancel = () => {
        const originLocation = data?.location;

        reset();
        if (!originLocation) {
            setState('nodata');
            setLocation(data?.location);
            return;
        }

        setState('view');
        setLocation(originLocation);
        mapInstance?.setView(
            [originLocation.latitude, originLocation.longitude],
            PREFER_ZOOM_LEVEL,
        );
    };

    // Remove location
    const confirm = useConfirm();
    const handleRemove = () => {
        confirm({
            type: 'warning',
            title: getIntlText('common.label.remove'),
            description: getIntlText('device.message.confirm_remove_location'),
            onConfirm: async () => {
                if (!data?.id) return;

                setLoading(true);
                const [err, res] = await awaitWrap(
                    deviceAPI.clearLocation({
                        id: data.id,
                    }),
                );

                setLoading(false);
                if (err || !isRequestSuccess(res)) return;

                await onEditSuccess?.();
                setLocation(undefined);
            },
        });
    };

    // ---------- Location Data Update and Interactions ----------
    const [location, setLocation] = useState<LocationType>();

    const handlePositionChange = useCallback<NonNullable<LocationMapProps['onPositionChange']>>(
        position => {
            setLocation(d => {
                if (position.toString() === [d?.latitude, d?.longitude].toString()) return d;
                return {
                    ...d,
                    latitude: position[0],
                    longitude: position[1],
                };
            });
        },
        [],
    );

    // Reset form data panel state change
    useEffect(() => {
        if (editing) return;
        reset();
        setLocation(data?.location);
    }, [data, editing, reset]);

    // Update form data and panel state when external location data change
    useEffect(() => {
        if (!data?.location) {
            setState('nodata');
            setLocation(undefined);
            return;
        }

        setState('view');
        setLocation(data.location);
        mapInstance?.setView([data.location.latitude, data.location.longitude], PREFER_ZOOM_LEVEL);
    }, [data, mapInstance]);

    // Update Location when form values change
    useDebounceEffect(
        () => {
            if (!editing || !formLat || !formLng || Object.keys(formState.errors).length) return;
            setLocation(d => ({
                ...d,
                latitude: formLat,
                longitude: formLng,
            }));
            mapInstance?.setView([formLat, formLng]);
        },
        [editing, formLat, formLng, formState.errors],
        { wait: 300 },
    );

    // Update Form Values when location change
    useEffect(() => {
        if (!editing || !location?.latitude || !location?.longitude) return;
        setValue('address', location.address);
        setValue('latitude', location.latitude);
        setValue('longitude', location.longitude);
    }, [editing, location, setValue]);

    return (
        <div className="ms-com-device-location" ref={rootRef}>
            <div className={cls('ms-com-location-edit-panel', `state-${state}`)}>
                {state === 'nodata' && (
                    <div className="edit-panel-nodata">
                        <PermissionControlHidden permissions={PERMISSIONS.DEVICE_EDIT}>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => openEditState()}
                            >
                                {getIntlText('device.label.edit_position')}
                            </Button>
                        </PermissionControlHidden>
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
                                startIcon={
                                    !loading ? <CheckIcon /> : <CircularProgress size={16} />
                                }
                                disabled={loading}
                                onClick={handleSubmit(onSubmit)}
                            >
                                {getIntlText('common.button.save')}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloseIcon />}
                                disabled={loading}
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
                                        {getIntlText('common.symbol.colon')}
                                    </div>
                                    <div className="location-detail-item-value">
                                        {location?.latitude || '-'}
                                    </div>
                                </li>
                                <li className="location-detail-item">
                                    <div className="location-detail-item-label">
                                        {getIntlText('common.label.longitude')}
                                        {getIntlText('common.symbol.colon')}
                                    </div>
                                    <div className="location-detail-item-value">
                                        {location?.longitude || '-'}
                                    </div>
                                </li>
                                <li className="location-detail-item">
                                    <div className="location-detail-item-label">
                                        {getIntlText('common.label.address')}
                                        {getIntlText('common.symbol.colon')}
                                    </div>
                                    <div className="location-detail-item-value">
                                        {location?.address || '-'}
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="edit-panel-view-footer">
                            <PermissionControlHidden permissions={PERMISSIONS.DEVICE_EDIT}>
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    disabled={loading}
                                    onClick={openEditState}
                                >
                                    {getIntlText('device.label.edit_position')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        !loading ? (
                                            <DeleteOutlineIcon />
                                        ) : (
                                            <CircularProgress size={16} />
                                        )
                                    }
                                    disabled={loading}
                                    onClick={handleRemove}
                                >
                                    {getIntlText('common.label.remove')}
                                </Button>
                            </PermissionControlHidden>
                        </div>
                    </div>
                )}
            </div>
            <LocationMap
                width={size?.width}
                height={size?.height}
                preferZoomLevel={PREFER_ZOOM_LEVEL}
                state={editing && !loading ? 'edit' : 'view'}
                className={cls({ 'd-none': !size?.width || !size?.height })}
                marker={!editing && location ? [location.latitude, location.longitude] : undefined}
                onPositionChange={handlePositionChange}
                onReady={setMapInstance}
            />
        </div>
    );
};

export default Location;
