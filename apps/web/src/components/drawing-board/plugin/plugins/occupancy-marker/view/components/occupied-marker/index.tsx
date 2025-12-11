import React, { useState } from 'react';
import { useDebounceEffect } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useStoreShallow } from '@milesight/shared/src/hooks';
import { ToiletDisabilityIcon } from '@milesight/shared/src/components';

import { ImageMarker, type Marker, type MarkerChangeEvent } from '@/components';
import { useStableValue } from '@/components/drawing-board/plugin/hooks';
import useControlPanelStore from '@/components/drawing-board/plugin/store';
import { type OccupancyMarkerConfigType } from '../../../control-panel';
import SmallSvg from '../../assets/120.svg';
import LargeSvg from '../../assets/136.svg';

/**
 * Disability sign marker id specification
 */
const DISABILITY_SIGN = 'D';

export interface OccupiedMarkerProps {
    isPreview?: boolean;
    config: OccupancyMarkerConfigType;
}

const OccupiedMarker: React.FC<OccupiedMarkerProps> = props => {
    const { isPreview, config } = props;
    const {
        markerExtraInfos,
        buildingInfo = {
            key: '112',
            name: 'Building 112',
            basicInfo: {
                buildingToiletType: 'FEMALE',
                totalToiletCount: 136,
            },
            toilets: [
                {
                    id: 'S001',
                    name: 'A001',
                },
                {
                    id: 'S002',
                    name: 'A002',
                },
                {
                    id: 'D1',
                    name: 'F1',
                },
            ],
        },
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
                    x: 10.13105413105413,
                    y: 4.939994014220584,
                },
            },
            {
                id: 'D1',
                position: {
                    x: 53.008547008547005,
                    y: 4.939994014220584,
                },
            },
        ],
    } = config || {};
    const { stableValue: stableMarkerPositions } = useStableValue(makerPositions);
    const { setValuesToFormConfig } = useControlPanelStore(
        useStoreShallow(['setValuesToFormConfig']),
    );

    const [markers, setMarkers] = useState<Marker[]>([]);
    /**
     * Debounce update markers by stableMarkerPositions
     */
    useDebounceEffect(
        () => {
            if (!Array.isArray(stableMarkerPositions) || isEmpty(stableMarkerPositions)) {
                return;
            }

            console.log('stableMarkerPositions ? ', stableMarkerPositions);
            const newMarkers: Marker[] = stableMarkerPositions.map(item => ({
                ...item,
                style: {
                    width: 14,
                    height: 14,
                    borderRadius: 2,
                    backgroundColor: '#1eba62',
                },
                content: item?.id?.includes?.(DISABILITY_SIGN) ? (
                    <ToiletDisabilityIcon sx={{ width: '70%', height: '70%' }} />
                ) : undefined,
            }));

            setMarkers(newMarkers);
        },
        [stableMarkerPositions],
        { wait: 300 },
    );

    const handleMarkersChange = (event: MarkerChangeEvent) => {
        console.log('Change type:', event.type);
        console.log('Changed marker:', event.marker);
        setMarkers(event.markers);
    };

    const handleMarkerClick = (event: any, marker: Marker) => {
        console.log('handleMarkerClick:', event, marker);

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
         * Set all marker extra info to inactive
         */
        newMarkerExtraInfos = newMarkerExtraInfos.map(item => ({
            ...item,
            isActive: false,
        }));

        /**
         * Set click marker to active
         */
        const clickMarker = newMarkerExtraInfos.find(item => item.toiletId === marker.id);
        if (clickMarker) {
            clickMarker.isActive = true;
        } else {
            newMarkerExtraInfos.push({
                toiletId: marker.id,
                toiletName: buildingInfo?.toilets?.find(item => item.id === marker.id)?.name || '',
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

    useDebounceEffect(
        () => {
            console.log('markerExtraInfos ? ', markerExtraInfos);

            setMarkers(prevMarkers =>
                prevMarkers.map(item => ({
                    ...item,
                    style: {
                        ...item.style,
                        border: markerExtraInfos?.find(m => m.toiletId === item.id)?.isActive
                            ? '2px solid #8e66ff'
                            : undefined,
                    },
                })),
            );
        },
        [markerExtraInfos],
        {
            wait: 150,
        },
    );

    return (
        <div className="occupancy-marker-view__body">
            <ImageMarker
                image={buildingInfo?.basicInfo?.totalToiletCount === 120 ? SmallSvg : LargeSvg}
                markers={markers}
                onMarkersChange={handleMarkersChange}
                minMarkerWidth={14}
                minMarkerHeight={14}
                onMarkerClick={handleMarkerClick}
                editable={false}
            />
        </div>
    );
};

export default OccupiedMarker;
