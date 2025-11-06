import { get } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';

import { type DeviceDetail } from '@/services/http';
import { DEVICE_LATITUDE_ENTITY_UNIQUE_ID, DEVICE_LONGITUDE_ENTITY_UNIQUE_ID } from '@/constants';

export function useEntityStatus(entitiesStatus?: Record<string, EntityStatusData>) {
    const getDeviceLatitude = useMemoizedFn((device?: DeviceDetail) => {
        const latitudeEntity = device?.common_entities?.find(c =>
            c.key?.includes(DEVICE_LATITUDE_ENTITY_UNIQUE_ID),
        );
        if (!latitudeEntity?.id) {
            return;
        }

        return get(entitiesStatus, String(latitudeEntity.id))?.value;
    });

    const getDeviceLongitude = useMemoizedFn((device?: DeviceDetail) => {
        const longitudeEntity = device?.common_entities?.find(c =>
            c.key?.includes(DEVICE_LONGITUDE_ENTITY_UNIQUE_ID),
        );
        if (!longitudeEntity?.id) {
            return;
        }

        return get(entitiesStatus, String(longitudeEntity.id))?.value;
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
    };
}
