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
                            type: 'MultiEntitySelect',
                            label: 'Entity',
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
                            label: 'Title',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Title',
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
                            label: 'Time',
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
                            label: 'metrics',
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
