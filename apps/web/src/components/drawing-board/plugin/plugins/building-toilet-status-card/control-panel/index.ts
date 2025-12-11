import { t } from '@milesight/shared/src/utils/tools';
import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';

const ControlPanel = (): ControlPanelConfig<any> => {
    return {
        class: 'data_card',
        type: 'buildingToiletStatusCard',
        name: 'dashboard.plugin_name_building_toilet_status_card',
        defaultRow: 8,
        defaultCol: 12,
        minRow: 8,
        minCol: 12,
        maxRow: 8,
        maxCol: 12,
        fullscreenable: true,
        configProps: [
            {
                label: 'Entities Config',
                controlSetItems: [
                    {
                        name: 'standardOccupiedEntity',
                        config: {
                            type: 'EntitySelect',
                            label: t('dashboard.label.standard_occupied_toilet'),
                            controllerProps: {
                                name: 'standardOccupiedEntity',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                entityType: ['PROPERTY'],
                                entityValueType: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'disabilityOccupiedEntity',
                        config: {
                            type: 'EntitySelect',
                            label: t('dashboard.label.disability_occupied_toilet'),
                            controllerProps: {
                                name: 'disabilityOccupiedEntity',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                entityType: ['PROPERTY'],
                                entityValueType: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default ControlPanel;
