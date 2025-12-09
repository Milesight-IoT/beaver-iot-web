import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';

export interface OccupancyMarkerConfigType {
    title: string;
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
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_occupancy_marker'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default occupancyMarkerControlPanelConfig;
