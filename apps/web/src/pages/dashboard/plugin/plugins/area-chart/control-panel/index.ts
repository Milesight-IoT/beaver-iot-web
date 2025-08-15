import type { ControlPanelConfig } from '@/pages/dashboard/plugin/types';
import AreaChartIcon from '../icon.svg';

export interface AreaChartControlPanelConfig {
    entity?: EntityOptionType[];
    title?: string;
    time: number;
}

/**
 * The Area Chart Control Panel Config
 */
const areaChartControlPanelConfig = (): ControlPanelConfig<AreaChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'areaChart',
        name: 'Area',
        icon: AreaChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Area Chart Config',
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

export default areaChartControlPanelConfig;
