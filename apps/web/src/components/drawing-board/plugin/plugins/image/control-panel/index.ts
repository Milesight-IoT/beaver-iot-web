import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import type { ImageConfigType } from '../typings';
import ImageIcon from '../icon.svg';

/**
 * The Image Control Panel Config
 */
const imageControlPanelConfig = (): ControlPanelConfig<ImageConfigType> => {
    return {
        class: 'data_card',
        type: 'image',
        name: 'dashboard.plugin_name_image',
        icon: ImageIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 1,
        minCol: 2,
        maxRow: 12,
        maxCol: 12,
        configProps: [
            {
                label: 'image config',
                controlSetItems: [
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'label',
                                defaultValue: t('dashboard.plugin_name_image'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'radio',
                        config: {
                            type: 'ToggleRadio',
                            controllerProps: {
                                name: 'dataType',
                                defaultValue: 'entity',
                            },
                            componentProps: {
                                options: [
                                    {
                                        label: t('common.label.select_entity'),
                                        value: 'entity',
                                    },
                                    {
                                        label: t('common.label.local_upload'),
                                        value: 'upload',
                                    },
                                    {
                                        label: t('common.label.url'),
                                        value: 'url',
                                    },
                                ],
                            },
                        },
                    },
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
                            visibility(formData) {
                                return (
                                    !formData?.dataType || Boolean(formData?.dataType === 'entity')
                                );
                            },
                        },
                    },
                    {
                        name: 'upload',
                        config: {
                            type: 'Upload',
                            controllerProps: {
                                name: 'file',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                label: t('common.label.upload_image'),
                                multiple: false,
                                required: true,
                                matchExt: true,
                            },
                            visibility(formData) {
                                return Boolean(formData?.dataType === 'upload');
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.url'),
                            controllerProps: {
                                name: 'url',
                                rules: {
                                    required: true,
                                    pattern: {
                                        value: /^https?:\/\//,
                                        message: t('valid.input.url'),
                                    },
                                },
                            },
                            componentProps: {
                                required: true,
                                placeholder: t('common.placeholder.input'),
                            },
                            visibility(formData) {
                                return Boolean(formData?.dataType === 'url');
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default imageControlPanelConfig;
