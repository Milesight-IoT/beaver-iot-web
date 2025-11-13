import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import RadarChartIcon from '../icon.svg';

export interface RadarChartControlPanelConfig {
    entityList?: EntityOptionType[];
    title?: string;
    time: number;
    metrics: string;
}

/**
 * The radar Chart Control Panel Config
 */
const radarChartControlPanelConfig = (): ControlPanelConfig<RadarChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'radarChart',
        name: 'dashboard.plugin_name_radar',
        icon: RadarChartIcon,
        defaultRow: 3,
        defaultCol: 3,
        minRow: 2,
        minCol: 2,
        maxRow: 6,
        maxCol: 6,
        configProps: [
            {
                label: 'Radar Chart Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'MultiEntitySelect',
                            label: t('common.label.entity'),
                            controllerProps: {
                                name: 'entityList',
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
                                defaultValue: t('dashboard.plugin_name_radar'),
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
                    {
                        name: 'chartMetricsSelect',
                        config: {
                            type: 'ChartMetricsSelect',
                            label: t('common.label.metrics'),
                            controllerProps: {
                                name: 'metrics',
                                defaultValue: 'LAST',
                            },
                            componentProps: {
                                filters: ['SUM', 'COUNT'],
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

export default radarChartControlPanelConfig;
