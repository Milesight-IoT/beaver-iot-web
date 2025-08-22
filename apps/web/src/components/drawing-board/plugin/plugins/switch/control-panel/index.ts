import type {
    ControlPanelConfig,
    BaseControlConfig,
} from '@/components/drawing-board/plugin/types';
import type { AppearanceIconValue } from '@/components/drawing-board/plugin/components';
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
                            type: 'EntitySelect',
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
                                entityValueTypes: ['BOOLEAN'],
                                entityAccessMods: ['W', 'RW'],
                                entityExcludeChildren: true,
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
                                defaultValue: 'Label',
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'appearanceOfOffStatus',
                        config: {
                            type: 'AppearanceIcon',
                            label: 'Appearance of off status',
                            controllerProps: {
                                name: 'offAppearanceIcon',
                            },
                            componentProps: {
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
                            label: 'Appearance of on status',
                            controllerProps: {
                                name: 'onAppearanceIcon',
                            },
                            componentProps: {
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
