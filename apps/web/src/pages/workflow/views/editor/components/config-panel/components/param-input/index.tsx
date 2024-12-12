import { forwardRef, useImperativeHandle } from 'react';
import { AddIcon, DeleteIcon } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import { IconButton, MenuItem, Select, TextField } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { checkMaxLength } from '@milesight/shared/src/utils/validators';
import './style.less';

/**
 * Form Data Types
 */
export type FormDataItem = {
    arg: string;
    type: number | undefined;
};
export type FormDataProps = {
    params: FormDataItem[];
};
/**
 * Param Input Component
 *
 * Note: use in TriggerNode, CodeNode
 */
const Options = [
    {
        value: 0,
        labelIntlKey: 'workflow.node.config_panel_type_string',
    },
    {
        value: 1,
        labelIntlKey: 'workflow.node.config_panel_type_long',
    },
    {
        value: 2,
        labelIntlKey: 'workflow.node.config_panel_type_double',
    },
    {
        value: 3,
        labelIntlKey: 'workflow.node.config_panel_type_boolean',
    },
    {
        value: 4,
        labelIntlKey: 'workflow.node.config_panel_type_binary',
    },
];
type ParamInputProps = {
    title?: string;
};
const dynamicFields = 'params';
const ParamInput = forwardRef(({ title }: ParamInputProps, ref) => {
    const { getIntlText } = useI18n();

    // Initialize react-hook-form
    // TODO: set defaultValue
    const { control, handleSubmit, reset } = useForm<FormDataProps>();

    // Manage dynamic fields
    const { fields, append, remove } = useFieldArray({
        control,
        name: dynamicFields,
    });

    // Add new row
    const addParamRow = () => {
        append({
            arg: '',
            type: undefined,
        });
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        handleSubmit,
        resetForm: () => reset(),
    }));

    return (
        <div className="ms-params-input">
            <div>{title || getIntlText('workflow.node.config_panel_lable_arguments')}</div>
            <ul className="ms-params-list">
                {fields.map((field, index) => (
                    <li key={field.id} className="ms-params-item">
                        <Controller
                            name={`params.${index}.arg`}
                            control={control}
                            rules={{
                                validate: {
                                    checkMaxLength: checkMaxLength({ max: 50 }),
                                },
                            }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    className="ms-params-arg"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                        <Controller
                            name={`params.${index}.type`}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} className="ms-params-arg">
                                    {Options.map(({ value, labelIntlKey }) => (
                                        <MenuItem key={value} value={value}>
                                            {getIntlText(labelIntlKey)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        <IconButton onClick={() => remove(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </li>
                ))}
            </ul>
            <IconButton className="ms-params-add" onClick={addParamRow}>
                <AddIcon />
                <span className="ms-params-add-label">{getIntlText('common.label.add')}</span>
            </IconButton>
        </div>
    );
});

export default ParamInput;
