import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
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
        defaultRow: 3,
        defaultCol: 3,
        minRow: 2,
        minCol: 2,
        maxRow: 6,
        maxCol: 6,
        configProps: [
            {
                label: 'Pie Chart Config',
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
                                entityValueType: ['BOOLEAN', 'STRING'],
                                entityAccessMod: ['R', 'RW'],
                                customFilterEntity: 'filterEntityStringHasEnum',
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
