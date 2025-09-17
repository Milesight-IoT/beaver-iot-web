import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired, checkMaxLength } from '@milesight/shared/src/utils/validators';

/**
 * type of dataSource
 */
export type FormDataProps = {
    name?: string;
    remark?: string;
};

const useWorkflowFormItems = () => {
    const { getIntlText } = useI18n();
    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];
        result.push(
            {
                name: 'name',
                defaultValue: '',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 50 }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('workflow.modal.workflow_name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'remark',
                defaultValue: '',
                rules: {
                    validate: { checkMaxLength: checkMaxLength({ max: 500 }) },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            type="text"
                            label={getIntlText('common.label.remark')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        );

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useWorkflowFormItems;
