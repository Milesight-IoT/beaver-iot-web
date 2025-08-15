import type { ControlPanelConfig } from '@/pages/dashboard/plugin/types';
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
        name: 'Radar',
        icon: RadarChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Radar Chart Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'multiEntitySelect',
                            controllerProps: {
                                name: 'entityList',
                                defaultValue: [],
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                title: 'Entity',
                                entityType: ['PROPERTY'],
                                entityValueTypes: ['LONG', 'DOUBLE'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Title',
                                rules: {
                                    maxLength: 35,
                                },
                            },
                            componentProps: {
                                title: 'Title',
                            },
                        },
                    },
                    {
                        name: 'chartTimeSelect',
                        config: {
                            type: 'ChartTimeSelect',
                            controllerProps: {
                                name: 'time',
                                defaultValue: 86400000,
                            },
                            componentProps: {
                                title: 'Time',
                                style: {
                                    width: '100%',
                                },
                            },
                        },
                    },
                    {
                        name: 'chartMetricsSelect',
                        config: {
                            type: 'chartMetricsSelect',
                            controllerProps: {
                                name: 'metrics',
                                defaultValue: 'LAST',
                            },
                            componentProps: {
                                title: 'metrics',
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
