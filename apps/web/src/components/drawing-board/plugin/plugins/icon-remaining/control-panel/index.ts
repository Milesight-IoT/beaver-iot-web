import { t } from '@milesight/shared/src/utils/tools';

import type {
    ControlPanelConfig,
    BaseControlConfig,
} from '@/components/drawing-board/plugin/types';
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
        name: 'dashboard.plugin_name_remaining',
        icon: RemainingIcon,
        defaultRow: 2,
        defaultCol: 2,
        minRow: 2,
        minCol: 2,
        maxRow: 6,
        maxCol: 6,
        configProps: [
            {
                label: 'Remaining Config',
                controlSetItems: [
                    {
                        name: 'entitySelect',
                        config: {
                            type: 'EntitySelect',
                            label: t('common.label.entity'),
                            controllerProps: {
                                name: 'entity',
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
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_remaining'),
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
                            label: t('common.label.time'),
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
                            label: t('common.label.metrics'),
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
                            label: t('common.label.appearance'),
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
