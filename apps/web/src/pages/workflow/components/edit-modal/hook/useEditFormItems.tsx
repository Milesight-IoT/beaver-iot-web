import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';

/**
 * type of dataSource
 */
export type FormDataProps = {
    name: string;
    remark: string;
};

const useEditFormItems = (initialData: FormDataProps) => {
    const { getIntlText } = useI18n();
    const { name, remark } = initialData;
    const formItems = useMemo(() => {
        const result: ControllerProps<FormDataProps>[] = [];
        result.push(
            {
                name: 'name',
                defaultValue: name,
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('common.label.workflow_name')}
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
                defaultValue: remark,
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            type="text"
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

export default useEditFormItems;
