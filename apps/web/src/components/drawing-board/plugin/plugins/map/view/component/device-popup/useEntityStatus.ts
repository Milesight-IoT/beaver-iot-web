import { get, isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';

import { type DeviceDetail } from '@/services/http';
import {
    DEVICE_LATITUDE_ENTITY_UNIQUE_ID,
    DEVICE_LONGITUDE_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID,
} from '@/constants';

export function useEntityStatus(entitiesStatus?: Record<string, EntityStatusData>) {
    /**
     * Get common entity status value by entity key
     */
    const getCommonEntity = useMemoizedFn((entityKey: string, device?: DeviceDetail) => {
        const entity = device?.common_entities?.find(c => c.key?.includes(entityKey));
        if (!entity?.id) {
            return;
        }

        return get(entitiesStatus, String(entity.id))?.value;
    });

    const getDeviceLatitude = useMemoizedFn((device?: DeviceDetail) => {
        return getCommonEntity(DEVICE_LATITUDE_ENTITY_UNIQUE_ID, device);
    });

    const getDeviceLongitude = useMemoizedFn((device?: DeviceDetail) => {
        return getCommonEntity(DEVICE_LONGITUDE_ENTITY_UNIQUE_ID, device);
    });

    const aStatus = useMemoizedFn((device?: DeviceDetail): boolean | undefined => {
        return getCommonEntity(DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID, device);
    });

    const aContent = useMemoizedFn((device?: DeviceDetail): string | undefined => {
        return getCommonEntity(DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID, device);
    });

    /**
     * Get import entity status value by entity key
     */
    const getImportEntity = useMemoizedFn((entityKey: string, device?: DeviceDetail) => {
        const entity = device?.important_entities?.find(c => c.key?.includes(entityKey));
        if (!entity?.id) {
            return '-';
        }

        const val = get(entitiesStatus, String(entity.id))?.value;
        return `${isNil(val) ? '-' : val}${entity?.value_attribute?.unit || ''}`;
    });

    const temperature = useMemoizedFn((device?: DeviceDetail): string | undefined => {
        return getImportEntity('temperature', device);
    });

    const moisture = useMemoizedFn((device?: DeviceDetail): string | undefined => {
        return getImportEntity('soil_moisture', device);
    });

    const conductivity = useMemoizedFn((device?: DeviceDetail): string | undefined => {
        return getImportEntity('conductivity', device);
    });

    return {
        /**
         * Get device latitude entity status value
         */
        getDeviceLatitude,
        /**
         * Get device longitude entity status value
         */
        getDeviceLongitude,
        /**
         * Get alarm status by device
         */
        aStatus,
        /**
         * Get alarm content by device
         */
        aContent,
        /**
         * Get temperature by device
         */
        temperature,
        /**
         * Get moisture by device
         */
        moisture,
        /**
         * Get conductivity by device
         */
        conductivity,
    };
}
