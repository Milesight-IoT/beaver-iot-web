import { t } from '@milesight/shared/src/utils/tools';

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
        name: 'dashboard.plugin_name_trigger',
        icon: TriggerIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 1,
        maxRow: 2,
        maxCol: 2,
        configProps: [
            {
                label: 'Trigger Config',
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
                                entityType: ['SERVICE', 'PROPERTY'],
                                entityAccessMod: ['W', 'RW'],
                                excludeChildren: true,
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'label',
                                defaultValue: t('dashboard.plugin_name_trigger'),
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
                            label: t('common.label.appearance'),
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
