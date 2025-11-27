import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@mui/material';
import { useSize, useRequest } from 'ahooks';
import { isNil } from 'lodash-es';
import { useForm, Controller } from 'react-hook-form';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { Modal, toast, type ModalProps } from '@milesight/shared/src/components';
import { getGeoLocation, formatPrecision } from '@milesight/shared/src/utils/tools';
import { PREFER_ZOOM_LEVEL, type MapInstance } from '@/components';
import { type LocationType } from '@/services/http';
import { DEVICE_LOCATION_PRECISION } from '../../constants';
import LocationMap, { type Props as LocationMapProps, type LocationMapRef } from '../location-map';
import useLocationFormItems from '../../hooks/useLocationFormItems';

interface Props extends Omit<ModalProps, 'onOk'> {
    data?: LocationType;

    onConfirm: (data: Props['data']) => void;
}

type PositionType = [number | string, number | string];
const isPosEqual = (pos1: PositionType, pos2: PositionType) => {
    return +pos1[0] === +pos2[0] && +pos1[1] === +pos2[1];
};

const InputModal: React.FC<Props> = memo(({ data, visible, onCancel, onConfirm, ...props }) => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();

    // ---------- Map ----------
    const [mapInstance, setMapInstance] = useState<MapInstance>();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const locationMapRef = useRef<LocationMapRef>(null);
    const mapSize = useSize(mapContainerRef);

    // ---------- Form Items and Actions ----------
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

        if (!visible || !latitude || !longitude || Object.keys(formState.errors).length) return;

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
    }, [visible, formState.errors, getValues]);
    const formItems = useLocationFormItems({ onBlur: handleBlur });
    // const [formLat, formLng] = watch(['latitude', 'longitude']);

    const handleConfirm = handleSubmit(data => {
        onConfirm(data);
        setLocation({ ...data });
    });

    // ---------- Location Data Update and Interactions ----------
    const [location, setLocation] = useState<LocationType>();
    const { run: getLocation, cancel: cancelGetLocation } = useRequest(getGeoLocation, {
        manual: true,
        onError(err) {
            console.error(err);
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
            toast.error({
                key: 'get_location_failed',
                content: getIntlText('device.message.get_location_failed'),
            });
        },
        onSuccess(latlng) {
            setLocation(d => ({
                ...d,
                latitude: latlng.lat,
                longitude: latlng.lng,
            }));
            mapInstance?.setView([latlng.lat, latlng.lng], PREFER_ZOOM_LEVEL);
        },
    });
    const handlePositionChange = useCallback<NonNullable<LocationMapProps['onPositionChange']>>(
        pos => {
            const { address } = getValues();
            setLocation(d => {
                if (d && isPosEqual([pos[0], pos[1]], [d.latitude, d.longitude])) {
                    return d;
                }

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

    // Reset form data when modal close
    useEffect(() => {
        if (visible) return;
        reset();
        setLocation(undefined);
    }, [visible, reset]);

    // Update form data when external data change
    useEffect(() => {
        if (!visible || !mapInstance) return;

        if (data?.latitude && data?.longitude) {
            setLocation({ ...data });
            mapInstance?.setView([data.latitude, data.longitude], PREFER_ZOOM_LEVEL, {
                // @ts-ignore
                reset: true,
            });
            return;
        }

        getLocation();
        return () => cancelGetLocation();
    }, [data, visible, mapInstance, getLocation, cancelGetLocation, getIntlText]);

    // Update Form Values when location change
    useEffect(() => {
        if (isNil(location?.latitude) || isNil(location?.longitude)) return;

        setFormLatLng(location.latitude, location.longitude);
        setValue('address', location.address);
        triggerValidation();
    }, [location, setValue, setFormLatLng, triggerValidation]);

    return (
        <Modal
            className="ms-location-input-modal"
            {...props}
            keepMounted
            showCloseIcon
            width="1200px"
            fullScreen={matchTablet}
            title={getIntlText('device.title.add_location_modal')}
            footer={null}
            visible={visible}
            onCancel={onCancel}
            onOk={handleConfirm}
        >
            <div className="map-wrap" ref={mapContainerRef}>
                <LocationMap
                    ref={locationMapRef}
                    state={visible ? 'edit' : 'view'}
                    width={mapSize?.width}
                    height={matchTablet ? 320 : mapSize?.height}
                    onReady={setMapInstance}
                    onPositionChange={handlePositionChange}
                />
            </div>
            <div className="form-wrap">
                <div className="form-list">
                    {formItems.map(item => (
                        <Controller key={item.name} control={control} {...item} />
                    ))}
                </div>
                <div className="form-actions">
                    <Button variant="outlined" onClick={onCancel}>
                        {getIntlText('common.button.cancel')}
                    </Button>
                    <Button variant="contained" fullWidth={matchTablet} onClick={handleConfirm}>
                        {getIntlText('common.button.confirm')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
});

export default InputModal;
