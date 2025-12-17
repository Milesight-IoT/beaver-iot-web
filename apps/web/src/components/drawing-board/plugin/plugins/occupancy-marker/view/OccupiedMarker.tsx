import React, { useMemo } from 'react';
import { isEmpty } from 'lodash-es';
import { type KonvaEventObject } from 'konva/lib/Node';

import { useStoreShallow } from '@milesight/shared/src/hooks';

import { ImageMarker, type Marker, type MarkerChangeEvent } from '@/components';
import useControlPanelStore from '@/components/drawing-board/plugin/store';
import SmallSvg from './assets/120.svg';
import LargeSvg from './assets/136.svg';
import { type MarkerExtraInfoProps } from '../control-panel';
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
}

const OccupiedMarker: React.FC<OccupiedMarkerProps> = props => {
    const { isPreview, size, markers, markerExtraInfos, buildingInfo } = props;

    const { setValuesToFormConfig } = useControlPanelStore(
        useStoreShallow(['setValuesToFormConfig']),
    );

    const handleMarkersChange = (event: MarkerChangeEvent) => {
        console.log('Change type:', event.type);
        console.log('Changed marker:', event.marker);
    };

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
            Reflect.set(clickMarker, 'isActive', true);
        } else {
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

    return (
        <div className="occupancy-marker-view__body">
            <ImageMarker
                width={canvasWidth}
                height={canvasHeight}
                image={buildingInfo?.basicInfo?.totalToiletCount === 120 ? SmallSvg : LargeSvg}
                markers={markers}
                onMarkersChange={handleMarkersChange}
                onMarkerClick={handleMarkerClick}
                editable={false}
            />
        </div>
    );
};

export default OccupiedMarker;
