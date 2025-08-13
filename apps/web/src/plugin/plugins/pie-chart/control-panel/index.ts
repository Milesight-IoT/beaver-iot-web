import type { ControlPanelConfig } from '@/plugin/types';
import PieChartIcon from '../icon.svg';

export interface PieChartControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    time: number;
    metrics: string;
}

/**
 * The Pie Chart Control Panel Config
 */
const pieChartControlPanelConfig = (): ControlPanelConfig<PieChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'pieChart',
        name: 'Pie',
        icon: PieChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Pie Chart Config',
                controlSetItems: [
                    {
                        name: 'entitySelect',
                        config: {
                            type: 'entitySelect',
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
                                entityValueTypes: ['BOOLEAN', 'STRING'],
                                entityAccessMod: ['R', 'RW'],
                                customFilterEntity: 'filterEntityStringHasEnum',
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'Title',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Title',
                            },
                            componentProps: {
                                slotProps: {
                                    input: {
                                        inputProps: {
                                            maxLength: 35,
                                        },
                                    },
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
                            type: 'chartMetricsSelect',
                            label: 'metrics',
                            controllerProps: {
                                name: 'metrics',
                                defaultValue: 'COUNT',
                            },
                            componentProps: {
                                filters: ['LAST', 'MIN', 'MAX', 'AVG', 'SUM'],
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

export default pieChartControlPanelConfig;
