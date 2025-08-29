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
        name: 'Text',
        icon: TextIcon,
        defaultRow: 2,
        defaultCol: 3,
        minRow: 1,
        minCol: 2,
        configProps: [
            {
                label: 'Text Config',
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
                                entityValueType: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                entityAccessMod: ['R', 'RW'],
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
                                defaultValue: 'Text',
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
                            label: 'Font Size',
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
