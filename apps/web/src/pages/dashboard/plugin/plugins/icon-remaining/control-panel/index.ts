import type { ControlPanelConfig, BaseControlConfig } from '@/pages/dashboard/plugin/types';
import RemainingIcon from '../icon.svg';

export interface IconRemainingControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    time: number;
    metrics: string;
}

/**
 * The icon remaining Control Panel Config
 */
const iconRemainingControlPanelConfig = (): ControlPanelConfig<IconRemainingControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'iconRemaining',
        name: 'Remaining',
        icon: RemainingIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 2,
        maxRow: 1,
        configProps: [
            {
                label: 'Remaining Config',
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
                    {
                        name: 'chartMetricsSelect',
                        config: {
                            type: 'chartMetricsSelect',
                            controllerProps: {
                                name: 'metrics',
                                defaultValue: 'LAST',
                            },
                            componentProps: {
                                title: 'metrics',
                                filters: ['SUM', 'COUNT'],
                                style: {
                                    width: '100%',
                                },
                            },
                        },
                    },
                    {
                        name: 'appearanceIcon',
                        config: {
                            type: 'AppearanceIcon',
                            controllerProps: {
                                name: 'appearanceIcon',
                            },
                            componentProps: {
                                label: 'Appearance',
                                defaultValue: {
                                    icon: 'DeleteIcon',
                                    color: '#7B4EFA',
                                },
                                legacyIconKey: 'icon',
                                legacyColorKey: 'iconColor',
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        formData,
                                    },
                                } as BaseControlConfig<IconRemainingControlPanelConfig>;
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default iconRemainingControlPanelConfig;
