import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
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
        defaultRow: 2,
        defaultCol: 2,
        minRow: 1,
        minCol: 2,
        maxRow: 4,
        maxCol: 12,
        configProps: [
            {
                label: 'Area Chart Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'MultiEntitySelect',
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
                ],
            },
        ],
    };
};

export default areaChartControlPanelConfig;
