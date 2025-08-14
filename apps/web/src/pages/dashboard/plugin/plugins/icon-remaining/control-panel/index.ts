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
                    {
                        name: 'chartMetricsSelect',
                        config: {
                            type: 'chartMetricsSelect',
                            label: 'metrics',
                            controllerProps: {
                                name: 'metrics',
                                defaultValue: 'LAST',
                            },
                            componentProps: {
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
                            label: 'Appearance',
                            controllerProps: {
                                name: 'appearanceIcon',
                            },
                            componentProps: {
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
