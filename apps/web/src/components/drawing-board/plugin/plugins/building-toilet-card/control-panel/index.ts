import { t } from '@milesight/shared/src/utils/tools';
import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';

const ControlPanel = (): ControlPanelConfig<any> => {
    return {
        class: 'data_card',
        type: 'buildingToiletCard',
        name: 'dashboard.plugin_name_building_toilet_card',
        defaultRow: 2,
        defaultCol: 2,
        minRow: 2,
        minCol: 2,
        maxRow: 4,
        maxCol: 2,
        configProps: [
            {
                label: 'Entities Config',
                controlSetItems: [
                    {
                        name: 'standardIdleEntity',
                        config: {
                            type: 'EntitySelect',
                            label: t('dashboard.label.standard_idle_toilet'),
                            controllerProps: {
                                name: 'standardIdleEntity',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                entityType: ['PROPERTY'],
                                entityValueType: ['LONG'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'disabilityIdleEntity',
                        config: {
                            type: 'EntitySelect',
                            label: t('dashboard.label.disability_idle_toilet'),
                            controllerProps: {
                                name: 'disabilityIdleEntity',
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
