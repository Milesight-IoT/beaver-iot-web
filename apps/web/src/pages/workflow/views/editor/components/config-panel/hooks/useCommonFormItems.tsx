import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';

/**
 * Form Item Props
 */
export type CommonFormDataProps = Record<string, any>;

const useCommonFormItems = () => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ControllerProps<CommonFormDataProps>[] = [];

        result.push(
            {
                name: 'nodeName',
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            autoComplete="off"
                            label={getIntlText('common.label.name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'nodeRemark',
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            autoComplete="off"
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

export default useCommonFormItems;
