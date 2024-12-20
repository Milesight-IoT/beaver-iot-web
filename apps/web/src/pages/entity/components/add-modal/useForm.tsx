import { useEffect, useState, useRef } from 'react';
import { ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import { v4 } from 'uuid';
import { useI18n } from '@milesight/shared/src/hooks';
import { UseFormItemsProps } from '@milesight/shared/src/components';
import { ENTITY_AEECSS_MODE } from '@/constant';
import { TableRowDataType } from '../../hooks/useColumns';

interface FormProps {
    preFormValues: Record<string, any>;
    formValues: Record<string, any>;
    setPreFormValues: (data: Record<string, any>) => void;
    defaultValues?: Record<string, any>;
    data?: TableRowDataType | null;
}

type ModeType = 'value' | 'enum';

const useForm = (props: FormProps) => {
    const { preFormValues, formValues, setPreFormValues, defaultValues, data } = props;
    const { getIntlText } = useI18n();
    const [formItems, setFormItems] = useState<UseFormItemsProps[]>([]);
    const [mode, setMode] = useState<ModeType>('value');
    const formItemsRef = useRef<UseFormItemsProps[]>([]);

    // Initial form configuration
    const initFormItems: UseFormItemsProps[] = [
        {
            label: getIntlText('device.label.param_entity_name'),
            name: 'name',
            type: 'TextField',
            defaultValue: defaultValues?.name,
            rules: {
                required: true,
                maxLength: {
                    value: 64,
                    message: '',
                },
            },
        },
        {
            label: getIntlText('common.label.key'),
            name: 'identifier',
            type: 'TextField',
            defaultValue: defaultValues?.identifier || v4().replace(/-/g, ''),
            rules: {
                required: true,
                maxLength: {
                    value: 64,
                    message: '',
                },
                pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores',
                },
            },
        },
        {
            label: getIntlText('entity.label.entity_type_of_access'),
            name: 'access_mod',
            type: 'Select',
            defaultValue: defaultValues?.access_mod,
            rules: {
                required: true,
            },
            props: {
                disabled: !!defaultValues,
                options: [
                    {
                        label: getIntlText('entity.label.entity_type_of_access_readonly'),
                        value: ENTITY_AEECSS_MODE.R,
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_access_write'),
                        value: ENTITY_AEECSS_MODE.W,
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_access_read_and_write'),
                        value: ENTITY_AEECSS_MODE.RW,
                    },
                ],
            },
        },
        {
            label: getIntlText('common.label.data_type'),
            name: 'value_type',
            type: 'Select',
            defaultValue: defaultValues?.value_type,
            rules: {
                required: true,
            },
            props: {
                disabled: !!defaultValues,
                componentProps: {
                    fullWidth: true,
                },
                options: [
                    {
                        label: getIntlText('entity.label.entity_type_of_string'),
                        value: 'STRING',
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_int'),
                        value: 'LONG',
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_float'),
                        value: 'DOUBLE',
                    },
                    {
                        label: getIntlText('entity.label.entity_type_of_boolean'),
                        value: 'BOOLEAN',
                    },
                ],
            },
        },
    ];

    const handleChangeMode = (_event: React.MouseEvent<HTMLElement>, value: ModeType) => {
        if (value !== null) {
            setMode(value);
        }
    };

    // Render mode switch component
    const renderButtonGroup = () => {
        return (
            <ToggleButtonGroup
                size="small"
                value={mode}
                disabled={!!defaultValues}
                exclusive
                onChange={handleChangeMode}
                className="entity-modal-button-group"
                fullWidth
            >
                <ToggleButton value="value">{getIntlText('entity.label.set_value')}</ToggleButton>
                <ToggleButton value="enum">
                    {getIntlText('entity.label.set_enumeration_items')}
                </ToggleButton>
            </ToggleButtonGroup>
        );
    };

    // Click event for adding a new form button
    const addFormItem = () => {
        const newFormItems = [...formItemsRef.current];
        const childrenLength = newFormItems?.[newFormItems.length - 1]?.children?.length || 0;
        const length = (childrenLength - 1) / 2 + 1;
        const initAddFormItem: UseFormItemsProps[] = [
            {
                label: getIntlText('common.label.key'),
                name: `temp_${formValues.value_type}_key_${length}`,
                type: 'TextField',
                defaultValue: defaultValues?.[`temp_${formValues.value_type}_key_${length}`],
                rules: {
                    required: true,
                },
                props: {
                    disabled: !!defaultValues,
                },
            },
            {
                label: getIntlText('common.label.value'),
                name: `temp_${formValues.value_type}_value_${length}`,
                type: 'TextField',
                defaultValue: defaultValues?.[`temp_${formValues.value_type}_value_${length}`],
                rules: {
                    required: true,
                },
                props: {
                    disabled: !!defaultValues,
                },
            },
        ];
        newFormItems[newFormItems.length - 1].children?.splice(
            childrenLength - 1,
            0,
            ...(initAddFormItem as any),
        );
        setFormItems(newFormItems);
    };

    const addButton = () => {
        return (
            <Button
                className="entity-modal-add-form-button"
                variant="outlined"
                fullWidth
                onClick={addFormItem}
                sx={{
                    '&.MuiButton-root': {
                        marginBottom: '24px',
                    },
                }}
            >
                {getIntlText('common.label.add')}
            </Button>
        );
    };

    // Switch mode and re-render the form
    const renderModeToForm = () => {
        if (mode === 'value') {
            return [
                {
                    label:
                        formValues.value_type === 'LONG'
                            ? getIntlText('entity.label.entity_minimum_value')
                            : getIntlText('entity.label.entity_minimum_length'),
                    name: formValues.value_type === 'LONG' ? 'min' : 'minLength',
                    type: 'TextField',
                    defaultValue:
                        defaultValues?.[formValues.value_type === 'LONG' ? 'min' : 'minLength'],
                    rules: {
                        required: true,
                    },
                    props: {
                        disabled: !!defaultValues,
                    },
                },
                {
                    label:
                        formValues.value_type === 'LONG'
                            ? getIntlText('entity.label.entity_maximum_value')
                            : getIntlText('entity.label.entity_maximum_length'),
                    name: formValues.value_type === 'LONG' ? 'max' : 'maxLength',
                    type: 'TextField',
                    defaultValue:
                        defaultValues?.[formValues.value_type === 'LONG' ? 'max' : 'maxLength'],
                    rules: {
                        required: true,
                    },
                    props: {
                        disabled: !!defaultValues,
                    },
                },
            ];
        }
        const childrenForms: any[] = [
            {
                label: getIntlText('entity.label.entity_items'),
                name: '',
                type: '',
                children: [
                    {
                        label: getIntlText('common.label.key'),
                        name: `temp_${formValues.value_type}_key_1`,
                        type: 'TextField',
                        defaultValue: defaultValues?.[`temp_${formValues.value_type}_key_1`],
                        rules: {
                            required: true,
                        },
                        props: {
                            disabled: !!defaultValues,
                        },
                    },
                    {
                        label: getIntlText('common.label.value'),
                        name: `temp_${formValues.value_type}_value_1`,
                        type: 'TextField',
                        defaultValue: defaultValues?.[`temp_${formValues.value_type}_value_1`],
                        rules: {
                            required: true,
                        },
                        props: {
                            disabled: !!defaultValues,
                        },
                    },
                ],
            },
        ];
        if (!defaultValues) {
            childrenForms[0].children.push({
                label: '',
                name: '',
                type: '',
                customRender: () => {
                    return addButton();
                },
            });
        } else if (defaultValues && data?.entityValueAttribute?.enum) {
            const curEnum = data?.entityValueAttribute?.enum;
            Object.keys(curEnum).forEach((key: string, index: number) => {
                if (index > 0) {
                    const curForm = [
                        {
                            label: getIntlText('common.label.key'),
                            name: `temp_${formValues.value_type}_key_${index + 1}`,
                            type: 'TextField',
                            defaultValue: key,
                            rules: {
                                required: true,
                            },
                            props: {
                                disabled: !!defaultValues,
                            },
                        },
                        {
                            label: getIntlText('common.label.value'),
                            name: `temp_${formValues.value_type}_value_${index + 1}`,
                            type: 'TextField',
                            defaultValue: curEnum[key],
                            rules: {
                                required: true,
                            },
                            props: {
                                disabled: !!defaultValues,
                            },
                        },
                    ];
                    childrenForms[0].children.push(...curForm);
                }
            });
        }
        return childrenForms;
    };

    const getFormItems = (type: string): any[] => {
        switch (type) {
            case 'LONG':
            case 'STRING':
                return [
                    ...initFormItems,
                    {
                        label: '',
                        name: '',
                        customRender: () => {
                            return renderButtonGroup();
                        },
                    },
                    ...renderModeToForm(),
                ];
            case 'DOUBLE':
                return [
                    ...initFormItems,
                    {
                        label: getIntlText('entity.label.entity_minimum_value'),
                        name: 'min',
                        type: 'TextField',
                        defaultValue: defaultValues?.min,
                        rules: {
                            required: true,
                        },
                        props: {
                            disabled: !!defaultValues,
                        },
                    },
                    {
                        label: getIntlText('entity.label.entity_maximum_value'),
                        name: 'max',
                        type: 'TextField',
                        defaultValue: defaultValues?.max,
                        rules: {
                            required: true,
                        },
                        props: {
                            disabled: !!defaultValues,
                        },
                    },
                ];
            case 'BOOLEAN':
                return [
                    ...initFormItems,
                    {
                        label: getIntlText('entity.label.entity_items'),
                        name: '',
                        type: '',
                        children: [
                            {
                                label: getIntlText('common.label.key'),
                                name: `temp_${formValues.value_type}_key_1`,
                                type: 'TextField',
                                col: 2,
                                // defaultValue:
                                //     defaultValues?.[`temp_${formValues.value_type}_key_1`] || true,
                                // props: {
                                //     disabled: true,
                                // },
                                customRender: () => {
                                    return (
                                        <div className="entity-add-modal-form-boolean-label">
                                            True
                                        </div>
                                    );
                                },
                            },
                            {
                                label: getIntlText('common.label.label'),
                                name: `temp_${formValues.value_type}_value_1`,
                                type: 'TextField',
                                col: 10,
                                defaultValue:
                                    defaultValues?.[`temp_${formValues.value_type}_value_1`],
                                rules: {
                                    required: true,
                                },
                                props: {
                                    disabled: !!defaultValues,
                                },
                            },
                            {
                                label: getIntlText('common.label.key'),
                                name: `temp_${formValues.value_type}_key_2`,
                                type: 'TextField',
                                col: 2,
                                // defaultValue:
                                //     defaultValues?.[`temp_${formValues.value_type}_key_2`] || false,
                                // props: {
                                //     disabled: true,
                                // },
                                customRender: () => {
                                    return (
                                        <div className="entity-add-modal-form-boolean-label">
                                            False
                                        </div>
                                    );
                                },
                            },
                            {
                                label: getIntlText('common.label.label'),
                                name: `temp_${formValues.value_type}_value_2`,
                                type: 'TextField',
                                col: 10,
                                defaultValue:
                                    defaultValues?.[`temp_${formValues.value_type}_value_2`],
                                rules: {
                                    required: true,
                                },
                                props: {
                                    disabled: !!defaultValues,
                                },
                            },
                        ],
                    },
                ];
            default:
                return initFormItems;
        }
    };

    useEffect(() => {
        if (data && !defaultValues) {
            return;
        }
        if (data?.entityValueAttribute?.enum) {
            setMode('enum');
        }
        if (preFormValues.value_type !== formValues.value_type || !formValues.value_type) {
            const newFormItem = getFormItems(formValues.value_type);
            setFormItems(newFormItem);
            setPreFormValues(formValues);
        }
    }, [formValues, data, defaultValues]);

    useEffect(() => {
        if (data && !defaultValues) {
            return;
        }
        const newFormItem = getFormItems(formValues.value_type);
        setFormItems(newFormItem);
    }, [mode, data, defaultValues]);

    useEffect(() => {
        formItemsRef.current = [...formItems];
    }, [formItems]);

    return formItems;
};

export default useForm;
