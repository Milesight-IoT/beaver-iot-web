import type { ControlPanelConfig, BaseControlConfig } from '@/pages/dashboard/plugin/types';
import type { AppearanceIconValue } from '@/pages/dashboard/plugin/components';
import SwitchIcon from '../icon.svg';

export interface SwitchControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    onAppearanceIcon?: AppearanceIconValue;
    offAppearanceIcon?: AppearanceIconValue;
}

/**
 * The switch Control Panel Config
 */
const switchControlPanelConfig = (): ControlPanelConfig<SwitchControlPanelConfig> => {
    return {
        class: 'operate',
        type: 'switch',
        name: 'Switch',
        icon: SwitchIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 1,
        maxRow: 1,
        configProps: [
            {
                label: 'Switch Config',
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
                                entityValueTypes: ['BOOLEAN'],
                                entityAccessMods: ['W', 'RW'],
                                entityExcludeChildren: true,
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Label',
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
                        name: 'appearanceOfOffStatus',
                        config: {
                            type: 'AppearanceIcon',
                            controllerProps: {
                                name: 'offAppearanceIcon',
                            },
                            componentProps: {
                                label: 'Appearance of off status',
                                defaultValue: {
                                    icon: 'WifiOffIcon',
                                    color: '#9B9B9B',
                                },
                                legacyIconKey: 'offIcon',
                                legacyColorKey: 'offIconColor',
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        formData,
                                    },
                                } as BaseControlConfig<SwitchControlPanelConfig>;
                            },
                        },
                    },
                    {
                        name: 'appearanceOfOnStatus',
                        config: {
                            type: 'AppearanceIcon',
                            controllerProps: {
                                name: 'onAppearanceIcon',
                            },
                            componentProps: {
                                label: 'Appearance of on status',
                                defaultValue: {
                                    icon: 'WifiIcon',
                                    color: '#8E66FF',
                                },
                                legacyIconKey: 'onIcon',
                                legacyColorKey: 'onIconColor',
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        formData,
                                    },
                                } as BaseControlConfig<SwitchControlPanelConfig>;
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default switchControlPanelConfig;
