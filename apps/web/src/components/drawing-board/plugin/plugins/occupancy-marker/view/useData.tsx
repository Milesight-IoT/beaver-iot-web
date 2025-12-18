import { useState, useEffect, useRef, useMemo } from 'react';
import { useDebounceEffect } from 'ahooks';
import { isEmpty, get, isNil } from 'lodash-es';

import { ToiletDisabilityIcon } from '@milesight/shared/src/components';

import { type EntityAPISchema, type DeviceStatus } from '@/services/http';
import { type Marker } from '@/components';
import { type OccupancyMarkerConfigType } from '../control-panel';
import { useStableValue } from '../../../hooks';
import { ToiletBuildingProps } from '../../../types';

/**
 * Disability sign marker id specification
 */
const DISABILITY_SIGN = 'D';

export const OCCUPIED_COLOR = '#f13535';
export const UNOCCUPIED_COLOR = '#1eba62';
export const OFFLINE_COLOR = '#c9cdd4';
export const PLAIN_COLOR = 'transparent';
export const ACTIVE_COLOR = '#8e66ff';

/**
 * Handle marker data
 */
export function useData(props: {
    config: OccupancyMarkerConfigType;
    entitiesStatus: EntityAPISchema['getEntitiesStatus']['response'];
}) {
    const { config, entitiesStatus } = props || {};
    const {
        markerExtraInfos,
        buildingInfo = {
            key: '112',
            name: 'Building 112',
            basicInfo: {
                buildingToiletType: 'FEMALE',
                totalToiletCount: 136,
                standardToiletCount: 128,
                disabilityToiletCount: 8,
            },
            toilets: [
                {
                    id: 'S001',
                    number: 'A001',
                },
                {
                    id: 'S002',
                    number: 'A002',
                },
                {
                    id: 'D1',
                    number: 'F1',
                },
                {
                    id: 'S003',
                    number: 'A003',
                },
                {
                    id: 'S005',
                    number: 'A005',
                },
                {
                    id: 'S006',
                    number: 'A006',
                },
            ],
        } as ToiletBuildingProps,
        makerPositions = [
            {
                id: 'S001',
                position: {
                    x: 6.284900284900284,
                    y: 4.939994014220584,
                },
            },
            {
                id: 'S002',
                position: {
                    x: 38.33618233618233,
                    y: 9.445019453783098,
                },
            },
            {
                id: 'D1',
                position: {
                    x: 53.008547008547005,
                    y: 4.939994014220584,
                },
            },
            {
                id: 'S003',
                position: {
                    x: 74.09116809116809,
                    y: 26.670116722698594,
                },
            },
            {
                id: 'S005',
                position: {
                    x: 66.54131054131054,
                    y: 19.515076318687548,
                },
            },
            {
                id: 'S006',
                position: {
                    x: 66.54131054131054,
                    y: 80.20041900455908,
                },
            },
        ],
    } = config || {};

    const { stableValue: stableMarkerPositions } = useStableValue(makerPositions);
    const [markers, setMarkers] = useState<Marker[]>([]);

    /**
     * Update extraInfosRef when markerExtraInfos change
     */
    const extraInfosRef = useRef(markerExtraInfos);
    useEffect(() => {
        extraInfosRef.current = markerExtraInfos;
    }, [markerExtraInfos]);

    /**
     * Initial update markers by stableMarkerPositions
     */
    useEffect(() => {
        if (!Array.isArray(stableMarkerPositions) || isEmpty(stableMarkerPositions)) {
            return;
        }

        const newMarkers: Marker[] = stableMarkerPositions.map(item => ({
            ...item,
            style: {
                width: 16,
                height: 16,
                borderRadius: 2,
                backgroundColor: PLAIN_COLOR,
                border: `1px solid ${OFFLINE_COLOR}`,
            },
        }));

        setMarkers(newMarkers);
    }, [stableMarkerPositions]);

    /**
     * Debounce update markers by entitiesStatus
     */
    useDebounceEffect(
        () => {
            function getBg(id: string) {
                const extraInfo = extraInfosRef.current?.find(e => e.toiletId === id);
                if (!extraInfo) {
                    return PLAIN_COLOR;
                }

                const occupiedId = get(extraInfo?.entityKeyToId, extraInfo?.occupiedState || '');
                const statusId = get(extraInfo?.entityKeyToId, extraInfo?.deviceStatus || '');
                const isOccupied = get(entitiesStatus, String(occupiedId))?.value;
                const status = get(entitiesStatus, String(statusId))?.value as DeviceStatus;
                if (isNil(isOccupied) || isNil(status)) {
                    return PLAIN_COLOR;
                }

                if (status === 'OFFLINE') {
                    return OFFLINE_COLOR;
                }

                if (status === 'ONLINE' && isOccupied === true) {
                    return OCCUPIED_COLOR;
                }

                if (status === 'ONLINE' && isOccupied === false) {
                    return UNOCCUPIED_COLOR;
                }

                return PLAIN_COLOR;
            }

            setMarkers(prevMarkers =>
                prevMarkers.map(item => {
                    const newBg = getBg(item.id);

                    return {
                        ...item,
                        style: {
                            ...item.style,
                            backgroundColor: newBg,
                            border:
                                newBg === PLAIN_COLOR ? `1px solid ${OFFLINE_COLOR}` : undefined,
                        },
                        content:
                            item?.id?.includes?.(DISABILITY_SIGN) &&
                            [UNOCCUPIED_COLOR, OCCUPIED_COLOR].includes(newBg) ? (
                                <ToiletDisabilityIcon sx={{ width: '70%', height: '70%' }} />
                            ) : undefined,
                    };
                }),
            );
        },
        [entitiesStatus],
        { wait: 300 },
    );

    /**
     * Debounce update markers by markerExtraInfos
     */
    useDebounceEffect(
        () => {
            setMarkers(prevMarkers =>
                prevMarkers.map(item => ({
                    ...item,
                    style: {
                        ...item.style,
                        border: markerExtraInfos?.find(m => m.toiletId === item.id)?.isActive
                            ? `2px solid ${ACTIVE_COLOR}`
                            : item?.style?.backgroundColor === PLAIN_COLOR
                              ? `1px solid ${OFFLINE_COLOR}`
                              : undefined,
                    },
                })),
            );
        },
        [markerExtraInfos],
        {
            wait: 100,
        },
    );

    /**
     * Calculate the number of standard unoccupied toilets
     */
    const standardUnoccupiedToiletCount = useMemo(() => {
        if (!Array.isArray(markers) || isEmpty(markers)) {
            return 0;
        }

        return markers.filter(m => {
            return !m?.content && m?.style?.backgroundColor === UNOCCUPIED_COLOR;
        }).length;
    }, [markers]);

    /**
     * Calculate the number of standard occupied toilets
     */
    const standardOccupiedToiletCount = useMemo(() => {
        if (!Array.isArray(markers) || isEmpty(markers)) {
            return 0;
        }

        return markers.filter(m => {
            return !m?.content && m?.style?.backgroundColor === OCCUPIED_COLOR;
        }).length;
    }, [markers]);

    /**
     * Calculate the number of disability unoccupied toilets
     */
    const disabilityUnoccupiedToiletCount = useMemo(() => {
        if (!Array.isArray(markers) || isEmpty(markers)) {
            return 0;
        }

        return markers.filter(m => {
            return m?.content && m?.style?.backgroundColor === UNOCCUPIED_COLOR;
        }).length;
    }, [markers]);

    /**
     * Calculate the number of disability occupied toilets
     */
    const disabilityOccupiedToiletCount = useMemo(() => {
        if (!Array.isArray(markers) || isEmpty(markers)) {
            return 0;
        }

        return markers.filter(m => {
            return m?.content && m?.style?.backgroundColor === OCCUPIED_COLOR;
        }).length;
    }, [markers]);

    /**
     * Calculate the number of offline toilets
     */
    const offlineToiletCount = useMemo(() => {
        if (!Array.isArray(markers) || isEmpty(markers)) {
            return 0;
        }

        return markers.filter(m => {
            return m?.style?.backgroundColor === OFFLINE_COLOR;
        }).length;
    }, [markers]);

    /**
     * Calculate the number of toilets with data available
     */
    const isAvailableToiletCount = useMemo(() => {
        const isAvailable = {
            available: 0,
            unavailable: 0,
        };
        const total = buildingInfo?.basicInfo?.totalToiletCount || 0;
        if (!total) {
            return isAvailable;
        }

        isAvailable.available =
            standardUnoccupiedToiletCount +
            standardOccupiedToiletCount +
            disabilityUnoccupiedToiletCount +
            disabilityOccupiedToiletCount +
            offlineToiletCount;
        isAvailable.unavailable = total - isAvailable.available;

        return isAvailable;
    }, [
        buildingInfo,
        standardUnoccupiedToiletCount,
        standardOccupiedToiletCount,
        disabilityUnoccupiedToiletCount,
        disabilityOccupiedToiletCount,
        offlineToiletCount,
    ]);

    return {
        markers,
        buildingInfo,
        /**
         * Calculate the number of standard unoccupied toilets
         */
        standardUnoccupiedToiletCount,
        /**
         * Calculate the number of standard occupied toilets
         */
        standardOccupiedToiletCount,
        /**
         * Calculate the number of disability unoccupied toilets
         */
        disabilityUnoccupiedToiletCount,
        /**
         * Calculate the number of disability occupied toilets
         */
        disabilityOccupiedToiletCount,
        /**
         * Calculate the number of offline toilets
         */
        offlineToiletCount,
        /**
         * Calculate the number of toilets with no data available
         */
        isAvailableToiletCount,
    };
}
