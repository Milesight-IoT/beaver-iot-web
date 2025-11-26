import React, { useEffect, useRef, useState, useCallback } from 'react';
import cls from 'classnames';
import { useSize } from 'ahooks';
import { isNil } from 'lodash-es';
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
import { getGeoLocation, formatPrecision, delay } from '@milesight/shared/src/utils/tools';
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
import { LocationMap, type LocationMapProps, type LocationMapRef } from '@/pages/device/components';
import { DEVICE_LOCATION_PRECISION } from '@/pages/device/constants';
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
type PositionType = [number | string, number | string];

const PREFER_ZOOM_LEVEL = 16;
const isPosEqual = (pos1: PositionType, pos2: PositionType) => {
    return +pos1[0] === +pos2[0] && +pos1[1] === +pos2[1];
};

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
            const { latitude, longitude } = getValues();

            if (!latitude && !longitude) {
                setLocation(d => {
                    if (d && (!isNil(d.latitude) || !isNil(d.longitude))) {
                        return d;
                    }
                    return {
                        ...d,
                        latitude: 0,
                        longitude: 0,
                    };
                });
            }

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
    const locationMapRef = useRef<LocationMapRef>(null);

    // ---------- Form Items and Actions ----------
    const [loading, setLoading] = useState(false);
    const {
        control,
        formState,
        handleSubmit,
        reset,
        setValue,
        getValues,
        trigger: triggerValidation,
    } = useForm<LocationType>({
        mode: 'onChange',
        shouldUnregister: true,
    });
    const setFormLatLng = useCallback(
        (lat: number | string, lng: number | string) => {
            const formatConfig = {
                precision: DEVICE_LOCATION_PRECISION,
                resultType: 'string',
            } as const;

            // @ts-ignore
            setValue('latitude', formatPrecision(lat, formatConfig));
            // @ts-ignore
            setValue('longitude', formatPrecision(lng, formatConfig));
        },
        [setValue],
    );
    const handleBlur = useCallback(() => {
        const { latitude, longitude, address } = getValues();

        if (!editing || !latitude || !longitude || Object.keys(formState.errors).length) return;

        setLocation(d => {
            if (d && isPosEqual([latitude, longitude], [d.latitude, d.longitude])) {
                return d;
            }

            // @ts-ignore
            // mapInstance?.setView([latitude, longitude], undefined, { reset: true });
            locationMapRef.current?.setPosition([latitude, longitude]);
            return {
                ...d,
                address,
                latitude,
                longitude,
            };
        });
    }, [editing, formState.errors, getValues]);
    const formItems = useLocationFormItems({ onBlur: handleBlur });

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
            setLocation(undefined);
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
        pos => {
            const { address } = getValues();
            setLocation(d => {
                if (d && isPosEqual(pos, [d.latitude, d.longitude])) return d;

                mapInstance?.setView([pos[0], pos[1]]);
                return {
                    ...d,
                    address,
                    latitude: pos[0],
                    longitude: pos[1],
                };
            });
        },
        [mapInstance, getValues],
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

    // Update Form Values when location change
    useEffect(() => {
        if (!editing || !location || isNil(location.latitude) || isNil(location.longitude)) {
            return;
        }

        setValue('address', location.address);
        setFormLatLng(location.latitude, location.longitude);
        triggerValidation();
    }, [editing, location, setValue, setFormLatLng, triggerValidation]);

    return (
        <div className="ms-com-device-location" ref={rootRef}>
            <div className={cls('ms-com-location-edit-panel', `state-${state}`)}>
                <div className={cls('edit-panel-nodata', { 'd-none': state !== 'nodata' })}>
                    <PermissionControlHidden permissions={PERMISSIONS.DEVICE_EDIT}>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={openEditState}
                        >
                            {getIntlText('device.label.edit_position')}
                        </Button>
                    </PermissionControlHidden>
                    <div className="empty-tip">
                        {getIntlText('device.message.no_device_location')}
                    </div>
                </div>
                <div className={cls('edit-panel-edit', { 'd-none': state !== 'edit' })}>
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
                            startIcon={!loading ? <CheckIcon /> : <CircularProgress size={16} />}
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
                <div className={cls('edit-panel-view', { 'd-none': state !== 'view' })}>
                    <div className="edit-panel-view-body">
                        <ul className="location-detail-list">
                            <li className="location-detail-item">
                                <span className="location-detail-item-label">
                                    {getIntlText('common.label.latitude')}
                                    {getIntlText('common.symbol.colon')}
                                </span>
                                <span className="location-detail-item-value">
                                    {isNil(location?.latitude) ? '-' : location.latitude}
                                </span>
                            </li>
                            <li className="location-detail-item">
                                <span className="location-detail-item-label">
                                    {getIntlText('common.label.longitude')}
                                    {getIntlText('common.symbol.colon')}
                                </span>
                                <span className="location-detail-item-value">
                                    {isNil(location?.longitude) ? '-' : location.longitude}
                                </span>
                            </li>
                            <li className="location-detail-item">
                                <span className="location-detail-item-label">
                                    {getIntlText('common.label.address')}
                                    {getIntlText('common.symbol.colon')}
                                </span>
                                <span className="location-detail-item-value">
                                    {location?.address || '-'}
                                </span>
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
            </div>
            <LocationMap
                ref={locationMapRef}
                width={size?.width}
                height={size?.height}
                preferZoomLevel={PREFER_ZOOM_LEVEL}
                state={editing ? 'edit' : 'view'}
                className={cls({ 'd-none': !size?.width || !size?.height })}
                marker={!editing && location ? [location.latitude, location.longitude] : undefined}
                onPositionChange={handlePositionChange}
                onReady={setMapInstance}
            />
        </div>
    );
};

export default Location;
