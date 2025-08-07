import type { ControlPanelConfig } from '@/plugin/types';

/**
 * The Line Control Panel Config
 */
const lineControlPanelConfig: ControlPanelConfig = {
    class: 'data_chart',
    type: 'lineChart',
    name: 'Line',
    icon: './icon.svg',
    defaultRow: 4,
    defaultCol: 4,
    minRow: 2,
    minCol: 2,
    configProps: [
        {
            description: 'This is line chart config',
            controlSetRows: [
                [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'Title',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Title',
                                rules: {
                                    required: true,
                                },
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
                ],
                [
                    {
                        name: 'chartEntityPosition',
                        config: {
                            type: 'chartEntityPosition',
                            controllerProps: {
                                name: 'entityPosition',
                                defaultValue: [],
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                entityType: ['PROPERTY'],
                                entityValueTypes: ['LONG', 'DOUBLE'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                ],
                [
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
                [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'LeftY Label',
                            controllerProps: {
                                name: 'leftYAxisUnit',
                                defaultValue: '',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                size: 'small',
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
                ],
                [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'RightY Label',
                            controllerProps: {
                                name: 'rightYAxisUnit',
                                defaultValue: '',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                size: 'small',
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
                ],
            ],
        },
    ],
};

export default lineControlPanelConfig;
