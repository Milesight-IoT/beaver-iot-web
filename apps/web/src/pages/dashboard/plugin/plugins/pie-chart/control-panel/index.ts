import type { ControlPanelConfig } from '@/pages/dashboard/plugin/types';
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
                            controllerProps: {
                                name: 'entity',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                title: 'Entity',
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
                                defaultValue: 'COUNT',
                            },
                            componentProps: {
                                title: 'metrics',
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
