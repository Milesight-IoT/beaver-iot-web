import React, { useMemo } from 'react';
import { isEmpty, get } from 'lodash-es';
import { type KonvaEventObject } from 'konva/lib/Node';
import { Box } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useStoreShallow } from '@milesight/shared/src/hooks';

import { ImageMarker, type Marker } from '@/components';
import useControlPanelStore from '@/components/drawing-board/plugin/store';
import { type EntityAPISchema, type DeviceStatus } from '@/services/http';
import svg120 from './assets/120.svg';
import svg136 from './assets/136.svg';
import svg120B104 from './assets/120_B104.svg';
import { type MarkerExtraInfoProps, MarkerNotificationProps } from '../control-panel';
import { type ToiletBuildingProps } from '../../../types';

export interface OccupiedMarkerProps {
    isPreview?: boolean;
    size?: {
        width: number;
        height: number;
    };
    markers: Marker[];
    markerExtraInfos?: MarkerExtraInfoProps[];
    buildingInfo?: ToiletBuildingProps;
    entitiesStatus?: EntityAPISchema['getEntitiesStatus']['response'];
}

const OccupiedMarker: React.FC<OccupiedMarkerProps> = props => {
    const { isPreview, size, markers, markerExtraInfos, buildingInfo, entitiesStatus } = props;

    const { setValuesToFormConfig } = useControlPanelStore(
        useStoreShallow(['setValuesToFormConfig']),
    );

    // const handleMarkersChange = (event: MarkerChangeEvent) => {
    //     console.log('Change type:', event.type);
    //     console.log('Changed marker:', event.marker);
    // };

    const handleMarkerClick = (_: KonvaEventObject<MouseEvent>, marker: Marker) => {
        /**
         * Only preview mode can click marker
         */
        if (!isPreview) {
            return;
        }

        let newMarkerExtraInfos = markerExtraInfos;
        if (!Array.isArray(newMarkerExtraInfos) || isEmpty(newMarkerExtraInfos)) {
            newMarkerExtraInfos = [];
        }

        /**
         * Set marker extra info to inactive or active
         */
        newMarkerExtraInfos = newMarkerExtraInfos.map(item => ({
            ...item,
            isActive: item.toiletId === marker.id,
        }));

        /**
         * Add marker extra info if not exists
         */
        const exists = newMarkerExtraInfos.some(item => item.toiletId === marker.id);
        if (!exists) {
            newMarkerExtraInfos.push({
                toiletId: marker.id,
                toiletNumber:
                    buildingInfo?.toilets?.find(item => item.id === marker.id)?.number || '',
                isActive: true,
            });
        }

        /**
         * Set new marker extra infos to form config
         */
        setValuesToFormConfig({
            markerExtraInfos: newMarkerExtraInfos,
        });
    };

    /**
     * Calculate canvas width
     */
    const canvasWidth = useMemo(() => {
        if (!size?.width) {
            return undefined;
        }

        /**
         * Subtract width to fit image marker
         */
        const subtractWidth = 16 + 16;
        if (size.width <= subtractWidth) {
            return undefined;
        }

        return size.width - subtractWidth;
    }, [size?.width]);

    /**
     * Calculate canvas height
     */
    const canvasHeight = useMemo(() => {
        if (!size?.height) {
            return undefined;
        }

        /**
         * Subtract height to fit image marker
         */
        const subtractHeight = 16 + 30 + 16 + 16;
        if (size.height <= subtractHeight) {
            return undefined;
        }

        return size.height - subtractHeight;
    }, [size?.height]);

    const getDeviceStatus = useMemoizedFn(
        (device: MarkerNotificationProps, extraInfo?: MarkerExtraInfoProps) => {
            const statusId = get(extraInfo?.entityKeyToId, String(device?.status));
            const statusVal = get(entitiesStatus, String(statusId))?.value as DeviceStatus;

            return statusVal === 'ONLINE' ? 'Online' : statusVal === 'OFFLINE' ? 'Offline' : '-';
        },
    );

    const getDeviceBattery = useMemoizedFn(
        (device: MarkerNotificationProps, extraInfo?: MarkerExtraInfoProps) => {
            const batteryId = get(extraInfo?.entityKeyToId, String(device?.battery));
            const batteryVal = get(entitiesStatus, String(batteryId))?.value;

            return batteryVal || '-';
        },
    );

    return (
        <div className="occupancy-marker-view__body">
            <ImageMarker
                width={canvasWidth}
                height={canvasHeight}
                image={get(
                    {
                        LAYOUT_120: svg120,
                        LAYOUT_120_SPECIAL: svg120B104,
                        LAYOUT_136: svg136,
                    },
                    buildingInfo?.basicInfo?.toiletsLayout || 'LAYOUT_120',
                    svg120,
                )}
                markers={markers}
                // onMarkersChange={handleMarkersChange}
                onMarkerClick={handleMarkerClick}
                editable={false}
                enablePopup
                popupTrigger="click"
                renderPopup={marker => {
                    const bName = buildingInfo?.toilets?.find(
                        item => item.id === marker.id,
                    )?.number;
                    const nameJsx = bName ? (
                        <Box
                            sx={{
                                fontSize: '16px',
                                fontWeight: '500',
                                lineHeight: '24px',
                            }}
                        >
                            {bName}
                        </Box>
                    ) : null;

                    const extraInfo = markerExtraInfos?.find(item => item.toiletId === marker.id);
                    const deviceInfoStr = extraInfo?.notification;
                    if (!deviceInfoStr) {
                        return nameJsx;
                    }

                    try {
                        const deviceInfo: MarkerNotificationProps[] = JSON.parse(deviceInfoStr);
                        if (!Array.isArray(deviceInfo) || isEmpty(deviceInfo)) {
                            return nameJsx;
                        }

                        return (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                }}
                            >
                                {nameJsx}
                                {deviceInfo.map(item => {
                                    const statusVal = getDeviceStatus(item, extraInfo);
                                    const s = (
                                        <span
                                            style={{
                                                color:
                                                    statusVal === 'Online'
                                                        ? 'var(--green-base)'
                                                        : undefined,
                                            }}
                                        >
                                            {statusVal}
                                        </span>
                                    );
                                    const b = getDeviceBattery(item, extraInfo);

                                    return (
                                        <Box
                                            key={item.name}
                                            sx={{
                                                width: '256px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color-gray)',
                                                backgroundColor: 'var(--component-background-gray)',
                                            }}
                                        >
                                            <Box
                                                title={item.name}
                                                sx={{
                                                    fontWeight: '500',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.name}
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                <Box sx={{ flex: '50%' }}>Status: {s}</Box>
                                                <Box sx={{ flex: '50%' }}>Battery: {b}%</Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        );
                    } catch {
                        return nameJsx;
                    }
                }}
            />
        </div>
    );
};

export default OccupiedMarker;
