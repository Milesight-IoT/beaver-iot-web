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

export default areaChartControlPanelConfig;
