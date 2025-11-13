import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import TextIcon from '../icon.svg';

export interface TextControlPanelConfig {
    entity?: EntityOptionType;
    label?: string;
    fontSize?: string;
}

/**
 * The text Control Panel Config
 */
const textControlPanelConfig = (): ControlPanelConfig<TextControlPanelConfig> => {
    return {
        class: 'data_card',
        type: 'text',
        name: 'dashboard.plugin_name_text',
        icon: TextIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        maxRow: 12,
        maxCol: 12,
        configProps: [
            {
                label: 'Text Config',
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
                                name: 'label',
                                defaultValue: t('dashboard.plugin_name_text'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'fontSizeInput',
                        config: {
                            type: 'Input',
                            label: t('common.label.font_size'),
                            controllerProps: {
                                name: 'fontSize',
                                defaultValue: '14',
                                rules: {
                                    min: 12,
                                    max: 50,
                                    pattern: {
                                        value: /^[1-9][0-9]*$/,
                                        message: t('valid.input.number'),
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default textControlPanelConfig;
