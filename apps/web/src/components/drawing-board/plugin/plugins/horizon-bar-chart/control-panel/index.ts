import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import HorizonBarChartIcon from '../icon.svg';

export interface BarChartControlPanelConfig {
    entity?: EntityOptionType[];
    title?: string;
    time: number;
}

/**
 * The Horizon Bar Chart Control Panel Config
 */
const horizonBarControlPanelConfig = (): ControlPanelConfig<BarChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'horizonBarChart',
        name: 'dashboard.plugin_name_horizon_bar',
        icon: HorizonBarChartIcon,
        defaultRow: 2,
        defaultCol: 2,
        minRow: 2,
        minCol: 2,
        maxRow: 4,
        maxCol: 12,
        fullscreenable: true,
        configProps: [
            {
                label: 'Horizon Bar Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'MultiEntitySelect',
                            label: t('common.label.entity'),
                            controllerProps: {
                                name: 'entity',
                                defaultValue: [],
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                entityType: ['PROPERTY'],
                                entityValueType: ['LONG', 'DOUBLE'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_horizon_bar'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'chartTimeSelect',
                        config: {
                            type: 'ChartTimeSelect',
                            label: t('common.label.time'),
                            controllerProps: {
                                name: 'time',
                                defaultValue: 86400000,
                            },
                            componentProps: {
                                style: {
                                    width: '100%',
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default horizonBarControlPanelConfig;
