import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import GaugeChartIcon from '../icon.svg';

export interface GaugeChartControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    time: number;
    metrics: string;
}

/**
 * The gauge Chart Control Panel Config
 */
const gaugeChartControlPanelConfig = (): ControlPanelConfig<GaugeChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'gaugeChart',
        name: 'Gauge',
        icon: GaugeChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Gauge Chart Config',
                controlSetItems: [
                    {
                        name: 'entitySelect',
                        config: {
                            type: 'EntitySelect',
                            label: 'Entity',
                            controllerProps: {
                                name: 'entity',
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

export default gaugeChartControlPanelConfig;
