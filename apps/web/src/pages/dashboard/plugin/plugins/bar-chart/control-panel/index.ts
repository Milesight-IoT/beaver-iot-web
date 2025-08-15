import type { ControlPanelConfig } from '@/pages/dashboard/plugin/types';
import BarChartIcon from '../icon.svg';

export interface BarChartControlPanelConfig {
    entity?: EntityOptionType[];
    title?: string;
    time: number;
}

/**
 * The bar Chart Control Panel Config
 */
const barChartControlPanelConfig = (): ControlPanelConfig<BarChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'barChart',
        name: 'Bar',
        icon: BarChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Bar Chart Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'multiEntitySelect',
                            controllerProps: {
                                name: 'entity',
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
                ],
            },
        ],
    };
};

export default barChartControlPanelConfig;
