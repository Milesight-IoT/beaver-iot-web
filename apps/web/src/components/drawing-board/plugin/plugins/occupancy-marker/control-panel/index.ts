import type {
    ControlPanelConfig,
    ToiletBuildingProps,
} from '@/components/drawing-board/plugin/types';

export interface MarkerNotificationProps {
    name: string;
    status: string;
    battery: string;
}

export interface MarkerExtraInfoProps {
    /** Unique marker ID S001~S112/D1~D8 */
    toiletId: string;
    /** Toilet number */
    toiletNumber: string;
    /** Occupied entity key */
    occupiedState?: string;
    /** Device status entity key */
    deviceStatus?: string;
    /** Notification device array JSON string */
    notification?: string;
    /** Is Active */
    isActive?: boolean;
    /** Entity key to ID mapping */
    entityKeyToId?: Record<ApiKey, ApiKey>;
}

export interface OccupancyMarkerConfigType {
    title: string;
    markerExtraInfos?: MarkerExtraInfoProps[];
    buildingInfo?: ToiletBuildingProps;
    makerPositions?: {
        /** Marker ID */
        id: string;
        /** Marker position */
        position: {
            /** X coordinate */
            x: number;
            /** Y coordinate */
            y: number;
        };
    }[];
}

/**
 * The Occupancy Marker Control Panel Config
 */
const occupancyMarkerControlPanelConfig = (): ControlPanelConfig<OccupancyMarkerConfigType> => {
    return {
        class: 'data_card',
        type: 'occupancyMarker',
        name: 'dashboard.plugin_name_occupancy_marker',
        defaultRow: 8,
        defaultCol: 12,
        minRow: 8,
        minCol: 12,
        maxRow: 8,
        maxCol: 12,
        configProps: [
            {
                label: 'occupancy marker config',
                controlSetItems: [
                    {
                        name: 'bind entities',
                        config: {
                            type: 'ToiletBindEntities',
                            controllerProps: {
                                name: 'markerExtraInfos',
                                rules: {
                                    required: true,
                                },
                            },
                        },
                    },
                    {
                        name: 'markerDrawer',
                        config: {
                            type: 'MarkerDrawer',
                            controllerProps: {
                                name: 'markerDrawer',
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default occupancyMarkerControlPanelConfig;
