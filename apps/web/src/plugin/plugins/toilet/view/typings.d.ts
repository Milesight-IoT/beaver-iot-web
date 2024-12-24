export interface ViewConfigProps {
    showTitle: boolean;
    title: string;
    entity: Record<string, any>;
    showIcon: boolean;
    icon: string;
    city: string;
    interval: string;
}

export interface MarkerType {
    id: number;
    x: number;
    y: number;
    radius: number;
    draggable: boolean;
    fill: string;
    data: {
        info?: string;
        locationId?: string;
        deviceId?: string;
    };
}

export type ViewConfigToiletProps = ViewConfigProps & {
    markers?: MarkerType[];
    imageUrl?: string;
    entity?: Array<{
        label: string;
        value: string;
        description: string;
        valueType: string;
        rawData: {
            deviceName: string;
            integrationName: string;
            entityId: string;
            entityKey: string;
        };
    }>;
};
