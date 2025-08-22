import type {
    ControlPanelConfig,
    BaseControlConfig,
} from '@/components/drawing-board/plugin/types';
import type { AppearanceIconValue } from '@/components/drawing-board/plugin/components';
import TriggerIcon from '../icon.svg';

export interface TriggerControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    appearanceIcon?: AppearanceIconValue;
}

/**
 * The trigger Control Panel Config
 */
const triggerControlPanelConfig = (): ControlPanelConfig<TriggerControlPanelConfig> => {
    return {
        class: 'operate',
        type: 'trigger',
        name: 'Trigger',
        icon: TriggerIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 1,
        maxRow: 1,
        configProps: [
            {
                label: 'Trigger Config',
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
                                entityType: ['SERVICE', 'PROPERTY'],
                                entityAccessMods: ['W', 'RW'],
                                entityExcludeChildren: true,
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: 'Label',
                            controllerProps: {
                                name: 'label',
                                defaultValue: 'Label',
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'appearanceOfStatus',
                        config: {
                            type: 'AppearanceIcon',
                            label: 'Appearance of status',
                            controllerProps: {
                                name: 'appearanceIcon',
                            },
                            componentProps: {
                                defaultValue: {
                                    icon: 'AdsClickIcon',
                                    color: '#8E66FF',
                                },
                                legacyIconKey: 'icon',
                                legacyColorKey: 'bgColor',
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        formData,
                                    },
                                } as BaseControlConfig<TriggerControlPanelConfig>;
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default triggerControlPanelConfig;
