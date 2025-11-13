import { t } from '@milesight/shared/src/utils/tools';

import type {
    BaseControlConfig,
    ControlPanelConfig,
} from '@/components/drawing-board/plugin/types';
import { type AppearanceIconValue } from '@/components/drawing-board/plugin/components';
import DataCardIcon from '../icon.svg';

export interface DataCardControlPanelConfigProps {
    entity?: EntityOptionType;
    label?: string;
    icons?: Record<string, AppearanceIconValue>;
}

/**
 * The data card Control Panel Config
 */
const dataCardControlPanelConfig = (): ControlPanelConfig<DataCardControlPanelConfigProps> => {
    return {
        class: 'data_card',
        type: 'dataCard',
        name: 'dashboard.plugin_name_card',
        icon: DataCardIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 1,
        maxCol: 2,
        maxRow: 2,
        configProps: [
            {
                label: 'data card config',
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
                                entityValueType: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
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
                                defaultValue: t('dashboard.plugin_name_card'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'multiAppearanceIcon',
                        config: {
                            type: 'MultiAppearanceIcon',
                            controllerProps: {
                                name: 'icons',
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        formData,
                                    },
                                } as BaseControlConfig<DataCardControlPanelConfigProps>;
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default dataCardControlPanelConfig;
