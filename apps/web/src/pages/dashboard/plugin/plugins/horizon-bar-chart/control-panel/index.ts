import type { ControlPanelConfig } from '@/pages/dashboard/plugin/types';
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
        name: 'Horizon Bar',
        icon: HorizonBarChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Horizon Bar Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'multiEntitySelect',
                            label: 'Entity',
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
                                entityValueTypes: ['LONG', 'DOUBLE'],
                                entityAccessMod: ['R', 'RW'],
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
                ],
            },
        ],
    };
};

export default horizonBarControlPanelConfig;
